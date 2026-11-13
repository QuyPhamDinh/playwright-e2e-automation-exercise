import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

const slug = (productName: string) => productName.toLowerCase().replace(/\s+/g, '-');

export class InventoryPage extends BasePage {
  readonly title: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sortDropdown: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sortDropdown = page.getByTestId('product-sort-container');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  async open(): Promise<void> {
    await this.goto('/inventory.html');
    await this.expectLoaded();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.title).toHaveText('Products');
  }

  async addToCart(productName: string): Promise<void> {
    await this.page.getByTestId(`add-to-cart-${slug(productName)}`).click();
  }

  async removeFromCart(productName: string): Promise<void> {
    await this.page.getByTestId(`remove-${slug(productName)}`).click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async expectProductNames(names: string[]): Promise<void> {
    await expect(this.items).toHaveCount(names.length);
    await expect(this.itemNames).toHaveText(names);
  }

  async expectProductPrices(prices: number[]): Promise<void> {
    await expect(this.items).toHaveCount(prices.length);
    await expect(this.itemPrices).toHaveText(prices.map((price) => `$${price.toFixed(2)}`));
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
