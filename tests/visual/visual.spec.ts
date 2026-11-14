import { test, expect } from '@playwright/test';
import { blockThirdPartyAds, waitForVisualStability } from '../../src/utils/visual';

test.describe('Automation Exercise visual regression', () => {
  test.beforeEach(async ({ page }) => {
    await blockThirdPartyAds(page);
  });

  test('login and signup forms', async ({ page }) => {
    await page.goto('/login');
    const formRegion = page.locator('#form .container');
    await expect(formRegion).toContainText('Login to your account');
    await expect(formRegion).toContainText('New User Signup!');
    await waitForVisualStability(page, formRegion);
    await expect(formRegion).toHaveScreenshot('login-signup.png');
  });

  test('first product card', async ({ page }) => {
    await page.goto('/products');
    const productCard = page.locator('.product-image-wrapper').first();
    const productInfo = productCard.locator('.productinfo');
    const thirdPartyAds = page.locator('iframe, [id*="google_ads"], .adsbygoogle');
    await expect(page.getByRole('heading', { name: 'All Products' })).toBeVisible();
    await expect(productInfo).toContainText('Blue Top');
    await waitForVisualStability(page, productInfo);
    await expect(productInfo).toHaveScreenshot('first-product-card.png', {
      mask: [thirdPartyAds],
      maskColor: '#ffffff',
    });
  });
});
