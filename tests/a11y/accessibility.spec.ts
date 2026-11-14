import { test, expect } from '@playwright/test';
import { findBlockingViolations } from '../../src/utils/a11y';

test.describe('Automation Exercise accessibility', () => {
  test('login and signup page has no serious or critical violations', async ({ page }, testInfo) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'New User Signup!' })).toBeVisible();

    const violations = await findBlockingViolations(page, testInfo);
    expect(violations).toEqual([]);
  });

  test('products page has no serious or critical violations', async ({ page }, testInfo) => {
    await page.goto('/products');
    await expect(page.getByRole('heading', { name: 'All Products' })).toBeVisible();
    await expect(page.locator('.product-image-wrapper').first()).toContainText('Blue Top');

    const violations = await findBlockingViolations(page, testInfo);
    expect(violations).toEqual([]);
  });
});
