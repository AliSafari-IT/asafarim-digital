import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
});

export type StripeClient = typeof stripe;

/**
 * Get Stripe Connect client ID for OAuth onboarding
 */
export function getStripeConnectClientId(): string {
  const clientId = process.env.STRIPE_CONNECT_CLIENT_ID;
  if (!clientId) {
    throw new Error('STRIPE_CONNECT_CLIENT_ID environment variable is required');
  }
  return clientId;
}

/**
 * Check if Stripe is configured in test mode
 */
export function isTestMode(): boolean {
  return stripeSecretKey?.startsWith('sk_test_') ?? false;
}
