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
    const imageElements = images.filter(
      (image): image is HTMLImageElement => image instanceof HTMLImageElement,
    );

    await Promise.all(
      imageElements.map((image) => {
        if (image.complete) {
          return Promise.resolve();
        }
        return new Promise<void>((resolve, reject) => {
          image.addEventListener('load', () => resolve(), { once: true });
          image.addEventListener(
            'error',
            () => reject(new Error(`Image failed to load: ${image.currentSrc || image.src}`)),
            { once: true },
          );
        });
      }),
    );

    const brokenImages = imageElements.filter((image) => image.naturalWidth === 0);
    if (brokenImages.length > 0) {
      throw new Error(
        `Visual target contains ${brokenImages.length} image(s) that did not load successfully`,
      );
    }
  });
}
