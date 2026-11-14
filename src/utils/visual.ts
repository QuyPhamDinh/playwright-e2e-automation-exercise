import { expect, type Locator, type Page } from '@playwright/test';

export async function blockThirdPartyAds(page: Page): Promise<void> {
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    if (
      url.includes('googlesyndication.com') ||
      url.includes('doubleclick.net') ||
      url.includes('fundingchoicesmessages.google.com') ||
      url.includes('adtrafficquality.google')
    ) {
      await route.abort();
      return;
    }
    await route.continue();
  });
}

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
