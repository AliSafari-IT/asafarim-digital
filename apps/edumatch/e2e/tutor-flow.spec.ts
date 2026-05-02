import { test, expect } from '@playwright/test';

test.describe('Tutor Flow', () => {
  test('tutor can view dashboard', async ({ page }) => {
    await page.goto('/tutor');
    await expect(page.getByText('Tutor Dashboard')).toBeVisible();
    await expect(page.getByText('Available')).toBeVisible();
  });

  test('tutor can view wallet', async ({ page }) => {
    await page.goto('/tutor/wallet');
    await expect(page.getByText('Wallet')).toBeVisible();
    await expect(page.getByText('Request Payout')).toBeVisible();
  });
});
