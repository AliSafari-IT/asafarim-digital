import { test, expect } from '@playwright/test';

test.describe('Student Flow', () => {
  test('student can create inquiry', async ({ page }) => {
    await page.goto('/student/inquiry/new');
    await page.getByText('Mathematics').click();
    await page.getByText('Continue').click();
    await page.getByPlaceholder('Type your question').fill('Help with algebra');
    await page.getByText('Continue').click();
    await expect(page.getByText('Review')).toBeVisible();
  });

  test('student can view quotes', async ({ page }) => {
    await page.goto('/student/quotes?inquiryId=test');
    await expect(page.getByText('Tutor Quotes')).toBeVisible();
  });
});
