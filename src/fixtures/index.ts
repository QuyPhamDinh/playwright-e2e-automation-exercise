import { test as base, expect } from '@playwright/test';
import { AccountClient, type Account } from '../api/AccountClient';
import { env } from '../config/env';
import { buildAccount } from '../data/accountFactory';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';

type TestFixtures = {
  account: Account;
  apiClient: AccountClient;
  loginPage: LoginPage;
  productsPage: ProductsPage;
};

export const test = base.extend<TestFixtures>({
  apiClient: async ({ playwright }, use, testInfo) => {
    const request = await playwright.request.newContext({
      baseURL: env.apiBaseUrl,
      extraHTTPHeaders: { Accept: 'application/json' },
    });

    try {
      await use(new AccountClient(request));
    } finally {
      try {
        await request.dispose();
      } catch (error: unknown) {
        const disposeError = error instanceof Error ? error : new Error(String(error));
        console.error(`Account API context disposal failed: ${disposeError.message}`);
        if (testInfo.status === 'passed') {
          throw disposeError;
        }
      }
    }
  },

  account: async ({ playwright }, use, testInfo) => {
    const request = await playwright.request.newContext({
      baseURL: env.apiBaseUrl,
      extraHTTPHeaders: { Accept: 'application/json' },
    });
    const account = buildAccount();
    const client = new AccountClient(request);
    let setupSucceeded = false;

    try {
      await client.create(account);
      setupSucceeded = true;
      await use(account);
    } finally {
      let cleanupError: Error | undefined;

      try {
        await client.delete(account);
      } catch (error: unknown) {
        cleanupError = error instanceof Error ? error : new Error(String(error));
        console.error(`Account cleanup failed for ${account.email}: ${cleanupError.message}`);
      }

      try {
        const cleanupStatus = cleanupError
          ? 'failed'
          : setupSucceeded
            ? 'deleted'
            : 'deleted-after-setup-failure';
        await testInfo.attach('account-cleanup.json', {
          body: JSON.stringify(
            cleanupError
              ? { status: 'failed', error: cleanupError.message }
              : { status: cleanupStatus, email: account.email },
          ),
          contentType: 'application/json',
        });
      } catch (error: unknown) {
        const reportError = error instanceof Error ? error : new Error(String(error));
        console.error(`Account cleanup report failed for ${account.email}: ${reportError.message}`);
      }

      try {
        await request.dispose();
      } catch (error: unknown) {
        const disposeError = error instanceof Error ? error : new Error(String(error));
        console.error(`Account API context disposal failed: ${disposeError.message}`);
        cleanupError ??= disposeError;
      }

      if (setupSucceeded && cleanupError && testInfo.status === 'passed') {
        throw cleanupError;
      }
    }
  },

  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  productsPage: async ({ page }, use) => use(new ProductsPage(page)),
});

export { expect };
