import { expect, type Locator, type Page } from '@playwright/test';

export async function waitForVisualStability(page: Page, target: Locator): Promise<void> {
  await expect(target).toBeVisible();
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await target.locator('img').evaluateAll(async (images) => {
    await Promise.all(
      images.map(
        (image) => {
          if (!(image instanceof HTMLImageElement) || image.complete) {
            return Promise.resolve();
          }
          return new Promise<void>((resolve) => {
            image.addEventListener('load', () => resolve(), { once: true });
            image.addEventListener('error', () => resolve(), { once: true });
          });
        },
      ),
    );
  });
}
