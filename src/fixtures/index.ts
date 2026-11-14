import { test as base, expect } from '@playwright/test';
import { AccountClient, type Account } from '../api/AccountClient';
import { env } from '../config/env';
import { buildAccount } from '../data/accountFactory';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';

type TestFixtures = {
  account: Account;
  loginPage: LoginPage;
  productsPage: ProductsPage;
};

export const test = base.extend<TestFixtures>({
  account: async ({ playwright }, use, testInfo) => {
    const request = await playwright.request.newContext({
      baseURL: env.apiBaseUrl,
      extraHTTPHeaders: { Accept: 'application/json' },
    });
    const account = buildAccount();
    const client = new AccountClient(request);
    let created = false;

    try {
      await client.create(account);
      created = true;
      await use(account);
    } finally {
      if (created) {
        try {
          await client.delete(account);
          await testInfo.attach('account-cleanup.json', {
            body: JSON.stringify({ status: 'deleted', email: account.email }),
            contentType: 'application/json',
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error);
          console.error(`Account cleanup failed for ${account.email}: ${message}`);
          await testInfo.attach('account-cleanup.json', {
            body: JSON.stringify({ status: 'failed', error: message }),
            contentType: 'application/json',
          });
        }
      }
      await request.dispose();
    }
  },

  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  productsPage: async ({ page }, use) => use(new ProductsPage(page)),
});

export { expect };
