import { test as base, expect } from '@playwright/test';
import { BookingClient } from '../api/BookingClient';
import { env } from '../config/env';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { InventoryPage } from '../pages/InventoryPage';
import { LoginPage } from '../pages/LoginPage';

type TestFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  bookingApi: BookingClient;
};

type WorkerFixtures = {
  /** API auth token, requested once per worker and shared by its tests. */
  authToken: string;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  authToken: [
    async ({ playwright }, use) => {
      const api = await playwright.request.newContext({ baseURL: env.apiBaseUrl });
      const response = await api.post('/auth', {
        data: { username: env.apiUser, password: env.apiPassword },
      });
      expect(response.ok(), 'auth request should succeed').toBeTruthy();
      const { token } = (await response.json()) as { token: string };
      expect(token, 'auth response should contain a token').toBeTruthy();
      await use(token);
      await api.dispose();
    },
    { scope: 'worker' },
  ],

  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),

  bookingApi: async ({ request, authToken }, use, testInfo) => {
    const client = new BookingClient(request, authToken);
    await use(client);
    const cleanupSummary = await client.cleanup();
    await testInfo.attach('booking-cleanup.json', {
      body: JSON.stringify(cleanupSummary, null, 2),
      contentType: 'application/json',
    });
    if (cleanupSummary.failures.length > 0) {
      console.warn('Booking cleanup failures:', JSON.stringify(cleanupSummary.failures));
    }
  },
});

export { expect };
