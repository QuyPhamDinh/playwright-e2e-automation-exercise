import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductDetailsPage extends BasePage {
  readonly productInformation: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly addedToCartDialog: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.productInformation = page.locator('.product-information');
    this.quantityInput = page.locator('#quantity');
    this.addToCartButton = page.locator('button.cart');
    this.addedToCartDialog = page.locator('#cartModal');
    this.continueShoppingButton = this.addedToCartDialog.locator('button.close-modal');
  }

  async gotoProduct(productId: number): Promise<void> {
    await super.goto(`/product_details/${productId}`);
  }

  async expectProduct(name: string, price: number): Promise<void> {
    await expect(this.productInformation.getByRole('heading', { name })).toBeVisible();
    await expect(this.productInformation).toContainText(`Rs. ${price}`);
  }

  async addWithQuantity(quantity: number): Promise<void> {
    await this.quantityInput.fill(String(quantity));
    await expect(this.quantityInput).toHaveValue(String(quantity));
    await this.addToCartButton.click();
    await expect(this.addedToCartDialog).toContainText(
      'Your product has been added to cart.',
    );
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
    await expect(this.addedToCartDialog).toBeHidden();
  }
}
