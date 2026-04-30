import { prisma, Prisma } from '@asafarim/db';
import type { Cart as CartType, CartItem, CreateCartItemInput } from './types';

const CART_EXPIRY_HOURS = 24;

export type Cart = CartType;

/**
 * Get or create an active cart for a user
 */
export async function getOrCreateCart(userId: string): Promise<Cart> {
  // Clean up expired carts first
  await cleanupExpiredCarts();

  let cart = await prisma.cart.findFirst({
    where: {
      userId,
      status: 'active',
    },
    include: {
      items: true,
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
        status: 'active',
        subtotalCents: 0,
        totalCents: 0,
        currency: 'EUR',
        expiresAt: new Date(Date.now() + CART_EXPIRY_HOURS * 60 * 60 * 1000),
      },
      include: {
        items: true,
      },
    });
  }

  return cart as Cart;
}

/**
 * Add an item to the user's cart
 */
export async function addToCart(
  userId: string,
  input: CreateCartItemInput
): Promise<CartItem> {
  const cart = await getOrCreateCart(userId);

  const item = await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productType: input.productType,
      productId: input.productId,
      productName: input.productName,
      description: input.description,
      unitPriceCents: input.unitPriceCents,
      quantity: input.quantity ?? 1,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      sellerId: input.sellerId,
      sellerType: input.sellerType ?? 'platform',
      platformFeePercent: input.platformFeePercent ?? 15,
    },
  });

  await recalculateCartTotals(cart.id);

  return item as CartItem;
}

/**
 * Remove an item from the cart
 */
export async function removeFromCart(userId: string, itemId: string): Promise<void> {
  const cart = await getOrCreateCart(userId);

  await prisma.cartItem.deleteMany({
    where: {
      id: itemId,
      cartId: cart.id,
    },
  });

  await recalculateCartTotals(cart.id);
}

/**
 * Update item quantity
 */
export async function updateCartItemQuantity(
  userId: string,
  itemId: string,
  quantity: number
): Promise<void> {
  if (quantity < 1) {
    await removeFromCart(userId, itemId);
    return;
  }

  const cart = await getOrCreateCart(userId);

  await prisma.cartItem.updateMany({
    where: {
      id: itemId,
      cartId: cart.id,
    },
    data: {
      quantity,
    },
  });

  await recalculateCartTotals(cart.id);
}

/**
 * Clear all items from cart
 */
export async function clearCart(userId: string): Promise<void> {
  const cart = await getOrCreateCart(userId);

  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
    },
  });

  await recalculateCartTotals(cart.id);
}

/**
 * Get cart with current totals
 */
export async function getCart(userId: string): Promise<Cart | null> {
  const cart = await prisma.cart.findFirst({
    where: {
      userId,
      status: 'active',
    },
    include: {
      items: true,
    },
  });

  if (!cart) return null;

  // Check if expired
  if (cart.expiresAt && new Date() > cart.expiresAt) {
    await prisma.cart.update({
      where: { id: cart.id },
      data: { status: 'abandoned' },
    });
    return null;
  }

  return cart as Cart;
}

/**
 * Mark cart as checkout in progress
 */
export async function markCartAsCheckout(
  cartId: string,
  checkoutSessionId: string
): Promise<void> {
  await prisma.cart.update({
    where: { id: cartId },
    data: {
      status: 'checkout',
      checkoutSessionId,
    },
  });
}

/**
 * Mark cart as completed
 */
export async function markCartAsCompleted(
  cartId: string,
  paymentIntentId: string
): Promise<void> {
  await prisma.cart.update({
    where: { id: cartId },
    data: {
      status: 'completed',
      paymentIntentId,
    },
  });
}

/**
 * Recalculate cart totals
 */
async function recalculateCartTotals(cartId: string): Promise<void> {
  const items = await prisma.cartItem.findMany({
    where: { cartId },
  });

  const subtotalCents = items.reduce(
    (sum: number, item: { unitPriceCents: number; quantity: number }) => sum + item.unitPriceCents * item.quantity,
    0
  );

  // For now, no additional taxes or fees at cart level
  const totalCents = subtotalCents;

  await prisma.cart.update({
    where: { id: cartId },
    data: {
      subtotalCents,
      totalCents,
      updatedAt: new Date(),
    },
  });
}

/**
 * Clean up expired carts
 */
async function cleanupExpiredCarts(): Promise<void> {
  const expired = await prisma.cart.findMany({
    where: {
      status: 'active',
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  for (const cart of expired) {
    await prisma.cart.update({
      where: { id: cart.id },
      data: { status: 'abandoned' },
    });
  }
}

/**
 * Merge carts (e.g., when user logs in after adding items as guest)
 */
export async function mergeCarts(
  sourceCartId: string,
  targetUserId: string
): Promise<Cart> {
  const sourceCart = await prisma.cart.findUnique({
    where: { id: sourceCartId },
    include: { items: true },
  });

  if (!sourceCart || sourceCart.items.length === 0) {
    return getOrCreateCart(targetUserId);
  }

  const targetCart = await getOrCreateCart(targetUserId);

  // Move all items from source to target
  for (const item of sourceCart.items) {
    await prisma.cartItem.create({
      data: {
        cartId: targetCart.id,
        productType: item.productType,
        productId: item.productId,
        productName: item.productName,
        description: item.description,
        unitPriceCents: item.unitPriceCents,
        quantity: item.quantity,
        metadata: item.metadata as Prisma.InputJsonValue,
        sellerId: item.sellerId,
        sellerType: item.sellerType,
        platformFeePercent: item.platformFeePercent,
      },
    });
  }

  // Mark source as abandoned
  await prisma.cart.update({
    where: { id: sourceCartId },
    data: { status: 'abandoned' },
  });

  await recalculateCartTotals(targetCart.id);

  return getOrCreateCart(targetUserId);
}

export { CART_EXPIRY_HOURS };
