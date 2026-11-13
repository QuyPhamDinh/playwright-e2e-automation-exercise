import { test, expect } from '../../src/fixtures';
import { customer } from '../../src/data/users';

test.describe('Checkout', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.open();
  });

  test('buys two products end to end', { tag: '@smoke' }, async ({ inventoryPage, cartPage, checkoutPage }) => {
    const products = ['Sauce Labs Backpack', 'Sauce Labs Onesie'];
    for (const product of products) {
      await inventoryPage.addToCart(product);
    }

    await inventoryPage.openCart();
    await cartPage.expectProducts(products);
    await cartPage.startCheckout();

    await checkoutPage.fillCustomerInfo(customer);
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
