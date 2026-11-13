import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect, selectors } from '@playwright/test';
import { AUTH_FILE, env } from './env';
import { LoginPage } from '../pages/LoginPage';
import { users } from '../data/users';

/**
 * Logs in once through the real UI and saves the session, so UI specs start
 * authenticated instead of repeating the login flow. Runs in every CI shard.
 * API-only runs set SKIP_UI_AUTH=1 so they don't need a browser.
 */
export default async function globalSetup(): Promise<void> {
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  selectors.setTestIdAttribute('data-test');

  if (process.env.SKIP_UI_AUTH === '1') {
    fs.writeFileSync(AUTH_FILE, JSON.stringify({ cookies: [], origins: [] }));
    return;
  }

  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ baseURL: env.uiBaseUrl });
    const page = await context.newPage();
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await expect(page).toHaveURL(/inventory\.html/);
    await context.storageState({ path: AUTH_FILE });
  } finally {
    await browser.close();
  }
}
