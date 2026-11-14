import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
  readonly heading: Locator;
  readonly productCards: Locator;
  readonly firstProductCard: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'All Products' });
    this.productCards = page.locator('.product-image-wrapper');
    this.firstProductCard = this.productCards.first();
  }

  async goto(): Promise<void> {
    await super.goto('/products');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.productCards).not.toHaveCount(0);
    await expect(this.firstProductCard).toContainText('Blue Top');
  }
}
