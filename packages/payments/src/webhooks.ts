import Stripe from 'stripe';
import { stripe } from './stripe-client';
import { prisma } from '@asafarim/db';
import type { WebhookEvent } from './types';

/**
 * Verify and construct a Stripe webhook event
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

/**
 * Handle Stripe webhook events
 * Returns true if event was processed successfully
 */
export async function handleWebhookEvent(event: Stripe.Event): Promise<boolean> {
  switch (event.type) {
    case 'checkout.session.completed':
      return handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);

    case 'payment_intent.succeeded':
      return handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);

    case 'payment_intent.payment_failed':
      return handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);

    case 'account.updated':
      return handleAccountUpdated(event.data.object as Stripe.Account);

    case 'payout.paid':
      return handlePayoutPaid(event.data.object as Stripe.Payout);

    default:
      console.log(`Unhandled webhook event type: ${event.type}`);
      return true;
  }
}

/**
 * Handle checkout.session.completed
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<boolean> {
  const cartId = session.metadata?.cartId;
  const userId = session.metadata?.userId;

  if (!cartId || !userId) {
    console.error('Missing cartId or userId in session metadata');
    return false;
  }

  // Update cart status
  await prisma.cart.update({
    where: { id: cartId },
    data: {
      status: 'completed',
      paymentIntentId: session.payment_intent as string,
    },
  });

  // Process marketplace payments if applicable
  if (session.payment_intent) {
    const paymentIntent = await stripe.paymentIntents.retrieve(
      session.payment_intent as string
    );
    await processMarketplacePayment(paymentIntent, cartId);
  }

  return true;
}

/**
 * Handle payment_intent.succeeded
 */
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
): Promise<boolean> {
  const cartId = paymentIntent.metadata?.cartId;

  if (!cartId) {
    console.error('Missing cartId in payment intent metadata');
    return false;
  }

  await prisma.cart.update({
    where: { id: cartId },
    data: {
      status: 'completed',
      paymentIntentId: paymentIntent.id,
    },
  });

  await processMarketplacePayment(paymentIntent, cartId);

  return true;
}

/**
 * Handle payment_intent.payment_failed
 */
async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent
): Promise<boolean> {
  const cartId = paymentIntent.metadata?.cartId;

  if (cartId) {
    await prisma.cart.update({
      where: { id: cartId },
      data: {
        status: 'active', // Reset to active so user can retry
      },
    });
  }

  return true;
}

/**
 * Handle account.updated (Stripe Connect)
 * Updates tutor payout_enabled status
 */
async function handleAccountUpdated(account: Stripe.Account): Promise<boolean> {
  // Find tutor by stripe_account_id
  const tutorProfile = await prisma.eduTutorProfile.findUnique({
    where: { stripeAccountId: account.id },
  });

  if (tutorProfile) {
    const payoutsEnabled = account.payouts_enabled ?? false;
    const chargesEnabled = account.charges_enabled ?? false;

    await prisma.eduTutorProfile.update({
      where: { id: tutorProfile.id },
      data: {
        payoutEnabled: payoutsEnabled && chargesEnabled,
      },
    });
  }

  return true;
}

/**
 * Handle payout.paid (Stripe Connect)
 */
async function handlePayoutPaid(payout: Stripe.Payout): Promise<boolean> {
  // Update tutor wallet
  const accountId = payout.destination as string;

  const tutorProfile = await prisma.eduTutorProfile.findUnique({
    where: { stripeAccountId: accountId },
  });

  if (tutorProfile) {
    await prisma.eduWallet.update({
      where: { tutorId: tutorProfile.userId },
      data: {
        balanceCents: {
          decrement: payout.amount,
        },
        lastPayoutAt: new Date(),
      },
    });

    // Record transaction
    await prisma.eduTransaction.create({
      data: {
        bookingId: '', // Would need to track this separately
        tutorId: tutorProfile.userId,
        type: 'PAYOUT',
        grossCents: 0,
        platformFeeCents: 0,
        netCents: -payout.amount, // Negative as it's a debit
        currency: payout.currency.toUpperCase(),
        stripePayoutId: payout.id,
      },
    });
  }

  return true;
}

/**
 * Process marketplace payment
 * Creates wallet entries for tutor payouts
 */
async function processMarketplacePayment(
  paymentIntent: Stripe.PaymentIntent,
  cartId: string
): Promise<void> {
  // Get cart items to identify sellers
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: true },
  });

  if (!cart) return;

  for (const item of cart.items) {
    if (item.sellerId && item.sellerType === 'tutor') {
      // Find tutor's user ID from stripe account
      const tutorProfile = await prisma.eduTutorProfile.findUnique({
        where: { stripeAccountId: item.sellerId },
      });

      if (tutorProfile) {
        const itemTotal = item.unitPriceCents * item.quantity;
        const platformFee = Math.round((itemTotal * item.platformFeePercent) / 100);
        const sellerAmount = itemTotal - platformFee;

        // Update or create wallet
        await prisma.eduWallet.upsert({
          where: { tutorId: tutorProfile.userId },
          create: {
            tutorId: tutorProfile.userId,
            pendingCents: sellerAmount,
            balanceCents: 0,
          },
          update: {
            pendingCents: {
              increment: sellerAmount,
            },
          },
        });

        // Create transaction record
        // Note: bookingId would need to be set based on the product type
        // For EduMatch tutoring, this would be the booking ID
        if (item.productType === 'edumatch_tutoring') {
          // Find the related booking from metadata
          const bookingId = (item.metadata as Record<string, string>)?.bookingId;
          if (bookingId) {
            await prisma.eduTransaction.create({
              data: {
                bookingId,
                tutorId: tutorProfile.userId,
                type: 'CHARGE',
                grossCents: itemTotal,
                platformFeeCents: platformFee,
                netCents: sellerAmount,
                currency: cart.currency,
                stripeChargeId: typeof paymentIntent.latest_charge === 'string' ? paymentIntent.latest_charge : undefined,
              },
            });
          }
        }
      }
    }
  }
}

/**
 * Get webhook secret from environment
 */
export function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET environment variable is required');
  }
  return secret;
}
