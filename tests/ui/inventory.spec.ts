import { test, expect } from '../../src/fixtures';

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.open();
  });

  test('lists six products', { tag: '@smoke' }, async ({ inventoryPage }) => {
    await expect(inventoryPage.items).toHaveCount(6);
  });

  test('sorts by price, low to high', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');
    await inventoryPage.expectProductPrices([7.99, 9.99, 15.99, 15.99, 29.99, 49.99]);
  });

  test('sorts by name, Z to A', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('za');
    await inventoryPage.expectProductNames([
      'Test.allTheThings() T-Shirt (Red)',
      'Sauce Labs Onesie',
      'Sauce Labs Fleece Jacket',
      'Sauce Labs Bolt T-Shirt',
      'Sauce Labs Bike Light',
      'Sauce Labs Backpack',
    ]);
  });

  test('cart badge follows add and remove', async ({ inventoryPage }) => {
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.addToCart('Sauce Labs Bike Light');
    await expect(inventoryPage.cartBadge).toHaveText('2');

    await inventoryPage.removeFromCart('Sauce Labs Backpack');
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });
});
