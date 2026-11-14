import { test, expect } from '../../src/fixtures';
import { blockThirdPartyAds } from '../../src/utils/visual';

test.describe('Shopping cart and checkout', () => {
  test.beforeEach(async ({ page }) => {
    await blockThirdPartyAds(page);
  });

  test('SHOP-001 keeps cart quantities and checkout total correct', { tag: '@smoke' }, async ({
    account,
    cartPage,
    checkoutPage,
    loginPage,
    productDetailsPage,
    productsPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(account.email, account.password);
    await loginPage.expectLoggedInAs(account.name);
    await loginPage.expectLogoutVisible();

    await cartPage.goto();
    await cartPage.expectEmpty();

    await productsPage.goto();
    await productsPage.expectLoaded();
    await productsPage.openProduct('Blue Top', 1);
    await productDetailsPage.expectProduct('Blue Top', 500);
    await productDetailsPage.addWithQuantity(4);
    await productDetailsPage.continueShopping();

    await productsPage.goto();
    await productsPage.openProduct('Men Tshirt', 2);
    await productDetailsPage.expectProduct('Men Tshirt', 400);
    await productDetailsPage.addWithQuantity(2);
    await productDetailsPage.continueShopping();

    await cartPage.goto();
    await cartPage.expectProductCount(2);

    const blueTopRow = cartPage.productRow('Blue Top');
    await expect(blueTopRow).toHaveCount(1);
    await expect(blueTopRow.locator('.cart_price')).toHaveText('Rs. 500');
    await expect(blueTopRow.locator('.cart_quantity')).toHaveText('4');
    await expect(blueTopRow.locator('.cart_total_price')).toHaveText('Rs. 2000');

    const menTshirtRow = cartPage.productRow('Men Tshirt');
    await expect(menTshirtRow).toHaveCount(1);
    await expect(menTshirtRow.locator('.cart_price')).toHaveText('Rs. 400');
    await expect(menTshirtRow.locator('.cart_quantity')).toHaveText('2');
    await expect(menTshirtRow.locator('.cart_total_price')).toHaveText('Rs. 800');

    await cartPage.proceedToCheckout();
    await checkoutPage.expectLoaded();

    const checkoutBlueTopRow = checkoutPage.productRow('Blue Top');
    await expect(checkoutBlueTopRow).toHaveCount(1);
    await expect(checkoutBlueTopRow.locator('.cart_price')).toHaveText('Rs. 500');
    await expect(checkoutBlueTopRow.locator('.cart_quantity')).toHaveText('4');
    await expect(checkoutBlueTopRow.locator('.cart_total_price')).toHaveText('Rs. 2000');

    const checkoutMenTshirtRow = checkoutPage.productRow('Men Tshirt');
    await expect(checkoutMenTshirtRow).toHaveCount(1);
    await expect(checkoutMenTshirtRow.locator('.cart_price')).toHaveText('Rs. 400');
    await expect(checkoutMenTshirtRow.locator('.cart_quantity')).toHaveText('2');
    await expect(checkoutMenTshirtRow.locator('.cart_total_price')).toHaveText('Rs. 800');

    await expect(checkoutPage.productRows).toHaveCount(2);
    await expect(checkoutPage.orderTotal).toHaveText('Rs. 2800');

    await expect(checkoutPage.deliveryAddress).toContainText(account.firstname);
    await expect(checkoutPage.deliveryAddress).toContainText(account.lastname);
    await expect(checkoutPage.deliveryAddress).toContainText(account.address1);
    await expect(checkoutPage.deliveryAddress).toContainText(account.address2);
    await expect(checkoutPage.deliveryAddress).toContainText(account.city);
    await expect(checkoutPage.deliveryAddress).toContainText(account.state);
    await expect(checkoutPage.deliveryAddress).toContainText(account.zipcode);
    await expect(checkoutPage.deliveryAddress).toContainText(account.country);
    await expect(checkoutPage.deliveryAddress).toContainText(account.mobile_number);
  });
});
