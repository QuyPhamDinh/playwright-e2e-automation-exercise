import { test, expect } from '../../src/fixtures';
import { customer } from '../../src/data/users';

test.describe('Checkout', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.open();
  });

  test('buys two products end to end', { tag: '@smoke' }, async ({ inventoryPage, cartPage, checkoutPage }) => {
    const items = [
      { name: 'Sauce Labs Backpack', quantity: '1', price: '$29.99' },
      { name: 'Sauce Labs Onesie', quantity: '1', price: '$7.99' },
    ];
    for (const item of items) {
      await inventoryPage.addToCart(item.name);
    }

    await inventoryPage.openCart();
    await cartPage.expectProducts(items.map((item) => item.name));
    await cartPage.startCheckout();

    await checkoutPage.fillCustomerInfo(customer);
    await checkoutPage.expectOverview(items, '$37.98', '$3.04', '$41.02');
    await checkoutPage.finish();
    await checkoutPage.expectOrderComplete();
  });

  test('requires a first name', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.openCart();
    await cartPage.startCheckout();

    await checkoutPage.fillCustomerInfo({ ...customer, firstName: '' });
    await expect(checkoutPage.errorMessage).toContainText('First Name is required');
  });
});
