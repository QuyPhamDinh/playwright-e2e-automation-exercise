import { test, expect } from '../../src/fixtures';

test('creates an account through API and logs in through the UI', { tag: '@smoke' }, async ({ account, loginPage }) => {
  await loginPage.goto();
  await loginPage.login(account.email, account.password);
  await expect(loginPage.loggedInAs).toContainText(`Logged in as ${account.name}`);
  await loginPage.expectLogoutVisible();
});
