/**
 * Payment types for unified checkout across all apps
 */

export interface CartItem {
  id: string;
  cartId: string;
  productType: 'edumatch_tutoring' | 'edumatch_premium' | 'content_generator' | 'ops_hub_plan' | 'other';
  productId: string;
  productName: string;
  description?: string;
  unitPriceCents: number;
  quantity: number;
  metadata: Record<string, unknown>;
  sellerId?: string; // For marketplace split payments (tutor, etc.)
  sellerType?: 'tutor' | 'platform' | 'external';
  platformFeePercent: number; // Default 15% for marketplace
  createdAt: Date;
  updatedAt: Date;
}

export interface Cart {
  id: string;
  userId: string;
  status: 'active' | 'checkout' | 'completed' | 'abandoned';
  items: CartItem[];
  subtotalCents: number;
  totalCents: number;
  currency: string;
  expiresAt?: Date;
  checkoutSessionId?: string;
  paymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCartItemInput {
  productType: CartItem['productType'];
  productId: string;
  productName: string;
  description?: string;
  unitPriceCents: number;
  quantity?: number;
  metadata?: Record<string, unknown>;
  sellerId?: string;
  sellerType?: CartItem['sellerType'];
  platformFeePercent?: number;
}

export interface CheckoutSessionInput {
  cartId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

export interface PaymentIntentResult {
  paymentIntentId: string;
  clientSecret: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

export interface MarketplaceSplit {
  platformFeeCents: number;
  sellerAmountCents: number;
  sellerStripeAccountId?: string;
}
