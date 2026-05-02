import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('checkout shows booking summary', async ({ page }) => {
    await page.goto('/student/checkout/test-quote');
    await expect(page.getByText('Complete Booking')).toBeVisible();
    await expect(page.getByText('Booking Summary')).toBeVisible();
    await expect(page.getByText('Pay Now')).toBeVisible();
  });
});
