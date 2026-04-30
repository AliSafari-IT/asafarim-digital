/**
 * @asafarim/payments
 * Unified payment system for all apps in the monorepo
 * 
 * Features:
 * - Shared shopping cart/basket across all apps
 * - Stripe Checkout integration
 * - Marketplace split payments (platform + seller)
 * - Webhook handlers for payment events
 */

// Export Stripe client
export { stripe, getStripeConnectClientId, isTestMode, type StripeClient } from './stripe-client';

// Export cart service
export {
  getOrCreateCart,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  getCart,
  markCartAsCheckout,
  markCartAsCompleted,
  mergeCarts,
  CART_EXPIRY_HOURS,
} from './cart-service';

// Export checkout functions
export {
  createCheckoutSession,
  createPaymentIntent,
  getCheckoutSession,
  getPaymentIntent,
  calculateMarketplaceSplit,
} from './checkout';

// Export webhook handlers
export {
  constructWebhookEvent,
  handleWebhookEvent,
  getWebhookSecret,
} from './webhooks';

// Export types
export type {
  Cart,
  CartItem,
  CreateCartItemInput,
  CheckoutSessionInput,
  CheckoutSessionResult,
  PaymentIntentResult,
  WebhookEvent,
  MarketplaceSplit,
} from './types';
