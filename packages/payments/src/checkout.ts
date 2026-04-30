import { stripe } from './stripe-client';
import { getOrCreateCart, markCartAsCheckout, type Cart } from './cart-service';
import type { CheckoutSessionInput, CheckoutSessionResult, PaymentIntentResult, MarketplaceSplit } from './types';

/**
 * Create a Stripe Checkout Session for a cart
 * Supports both simple payments and marketplace split payments
 */
export async function createCheckoutSession(
  input: CheckoutSessionInput
): Promise<CheckoutSessionResult> {
  const cart = await getOrCreateCart(input.userId);

  if (cart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  // Build line items from cart
  const lineItems = cart.items.map((item) => ({
    price_data: {
      currency: cart.currency.toLowerCase(),
      product_data: {
        name: item.productName,
        description: item.description || undefined,
        metadata: {
          productType: item.productType,
          productId: item.productId,
          sellerId: item.sellerId || 'platform',
        },
      },
      unit_amount: item.unitPriceCents,
    },
    quantity: item.quantity,
  }));

  // Calculate platform fee for marketplace items
  const platformFeeCents = calculatePlatformFee(cart);

  // Build transfer data for Connect if there are seller items
  const transferData = buildTransferData(cart);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    customer_email: input.customerEmail,
    metadata: {
      cartId: cart.id,
      userId: input.userId,
      ...input.metadata,
    },
    payment_intent_data: {
      metadata: {
        cartId: cart.id,
        userId: input.userId,
      },
      // For marketplace payments with transfer to seller
      ...(transferData && {
        transfer_data: transferData,
        application_fee_amount: platformFeeCents,
      }),
    },
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
  });

  if (!session.url) {
    throw new Error('Failed to create checkout session URL');
  }

  await markCartAsCheckout(cart.id, session.id);

  return {
    sessionId: session.id,
    url: session.url,
  };
}

/**
 * Create a Payment Intent for custom checkout flows (e.g., embedded in Flutter)
 */
export async function createPaymentIntent(
  cart: Cart,
  customerId?: string
): Promise<PaymentIntentResult> {
  const amount = cart.totalCents;
  const platformFeeCents = calculatePlatformFee(cart);
  const transferData = buildTransferData(cart);

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: cart.currency.toLowerCase(),
    customer: customerId,
    metadata: {
      cartId: cart.id,
      userId: cart.userId,
    },
    ...(transferData && {
      transfer_data: transferData,
      application_fee_amount: platformFeeCents,
    }),
  });

  return {
    paymentIntentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret!,
  };
}

/**
 * Retrieve a checkout session
 */
export async function getCheckoutSession(sessionId: string) {
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent', 'line_items'],
  });
}

/**
 * Retrieve a payment intent
 */
export async function getPaymentIntent(paymentIntentId: string) {
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Calculate platform fee for marketplace transactions
 * Default 15% of seller's portion
 */
function calculatePlatformFee(cart: Cart): number {
  return cart.items.reduce((fee: number, item: Cart['items'][number]) => {
    if (item.sellerId && item.sellerType !== 'platform') {
      const itemTotal = item.unitPriceCents * item.quantity;
      const itemFee = Math.round((itemTotal * item.platformFeePercent) / 100);
      return fee + itemFee;
    }
    return fee;
  }, 0);
}

/**
 * Build transfer data for Stripe Connect
 * For marketplace payments, transfer to seller's Stripe account
 */
function buildTransferData(cart: Cart): { destination: string } | undefined {
  // Find the primary seller (for simplicity, assumes one seller per cart)
  // For multiple sellers, you'd need to handle this differently
  const sellerItem = cart.items.find(
    (item) => item.sellerId && item.sellerType === 'tutor'
  );

  if (!sellerItem?.sellerId) {
    return undefined;
  }

  // sellerId should be the tutor's Stripe Connect account ID
  return {
    destination: sellerItem.sellerId,
  };
}

/**
 * Calculate marketplace split for a payment
 */
export function calculateMarketplaceSplit(
  totalCents: number,
  platformFeePercent: number = 15
): MarketplaceSplit {
  const platformFeeCents = Math.round((totalCents * platformFeePercent) / 100);
  const sellerAmountCents = totalCents - platformFeeCents;

  return {
    platformFeeCents,
    sellerAmountCents,
  };
}
