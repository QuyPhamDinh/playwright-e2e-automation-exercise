import { test, expect } from '../../src/fixtures';
import { AUTH_FILE } from '../../src/config/env';

test.describe('Visual regression', () => {
  test('login page', async ({ loginPage, page }) => {
    await loginPage.goto();
    await expect(page).toHaveScreenshot('login.png');
  });

  test.describe('logged in', () => {
    test.use({ storageState: AUTH_FILE });

    test('product list', async ({ inventoryPage, page }) => {
      await inventoryPage.open();
      await expect(page).toHaveScreenshot('inventory.png', { fullPage: true });
    });
  });
});
