import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly productRows: Locator;
  readonly proceedToCheckoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.productRows = page.locator('#cart_info tbody tr[id^="product-"]');
    this.proceedToCheckoutButton = page.getByText('Proceed To Checkout', { exact: true });
  }

  async goto(): Promise<void> {
    await super.goto('/view_cart');
  }

  productRow(name: string): Locator {
    return this.productRows.filter({ hasText: name });
  }

  async expectEmpty(): Promise<void> {
    await expect(this.productRows).toHaveCount(0);
    await expect(this.page.locator('#empty_cart')).toBeVisible();
  }

  async expectProductCount(count: number): Promise<void> {
    await expect(this.productRows).toHaveCount(count);
  }

  async proceedToCheckout(): Promise<void> {
    await this.proceedToCheckoutButton.click();
    await expect(this.page).toHaveURL(/\/checkout/);
  }
}
