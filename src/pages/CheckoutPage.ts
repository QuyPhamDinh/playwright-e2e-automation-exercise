import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export type CheckoutItem = {
  name: string;
  quantity: string;
  price: string;
};

export class CheckoutPage extends BasePage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly errorMessage: Locator;
  readonly confirmation: Locator;
  readonly itemNames: Locator;
  readonly itemQuantities: Locator;
  readonly itemPrices: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.finishButton = page.getByTestId('finish');
    this.errorMessage = page.getByTestId('error');
    this.confirmation = page.getByTestId('complete-header');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemQuantities = page.getByTestId('item-quantity');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.subtotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
  }

  async fillCustomerInfo(info: { firstName: string; lastName: string; postalCode: string }): Promise<void> {
    await this.firstName.fill(info.firstName);
    await this.lastName.fill(info.lastName);
    await this.postalCode.fill(info.postalCode);
    await this.continueButton.click();
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async expectOverview(
    items: CheckoutItem[],
    subtotal: string,
    tax: string,
    total: string,
  ): Promise<void> {
    await expect(this.itemNames).toHaveText(items.map((item) => item.name));
    await expect(this.itemQuantities).toHaveText(items.map((item) => item.quantity));
    await expect(this.itemPrices).toHaveText(items.map((item) => item.price));
    await expect(this.subtotal).toHaveText(`Item total: ${subtotal}`);
    await expect(this.tax).toHaveText(`Tax: ${tax}`);
    await expect(this.total).toHaveText(`Total: ${total}`);
  }

  async expectOrderComplete(): Promise<void> {
    await expect(this.confirmation).toHaveText('Thank you for your order!');
  }
}
