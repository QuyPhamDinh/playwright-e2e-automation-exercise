import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly productNames: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.productNames = page.getByTestId('inventory-item-name');
    this.checkoutButton = page.getByTestId('checkout');
  }

  async expectProducts(names: string[]): Promise<void> {
    await expect(this.productNames).toHaveText(names);
  }

  async startCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
