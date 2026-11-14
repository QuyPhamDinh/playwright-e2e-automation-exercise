import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  readonly productRows: Locator;
  readonly deliveryAddress: Locator;
  readonly orderTotal: Locator;

  constructor(page: Page) {
    super(page);
    this.productRows = page.locator('#cart_info tbody tr[id^="product-"]');
    this.deliveryAddress = page.locator('#address_delivery');
    this.orderTotal = page.locator('#cart_info .cart_total_price').last();
  }

  productRow(name: string): Locator {
    return this.productRows.filter({ hasText: name });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Address Details' })).toBeVisible();
    await expect(this.page.getByRole('heading', { name: 'Review Your Order' })).toBeVisible();
  }
}
