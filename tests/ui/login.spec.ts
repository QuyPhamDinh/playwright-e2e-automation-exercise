import { test, expect } from '../../src/fixtures';
import { users } from '../../src/data/users';

// Login specs must start logged out, so they drop the saved session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('standard user reaches the product list', { tag: '@smoke' }, async ({ loginPage, inventoryPage, page }) => {
    await loginPage.login(users.standard.username, users.standard.password);
    await expect(page).toHaveURL(/inventory\.html/);
    await inventoryPage.expectLoaded();
  });

  test('locked-out user sees an error', async ({ loginPage }) => {
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);
    await loginPage.expectError('this user has been locked out');
  });

  const invalidAttempts = [
    { name: 'wrong password', username: users.standard.username, password: 'nope', error: 'do not match' },
    { name: 'missing username', username: '', password: users.standard.password, error: 'Username is required' },
    { name: 'missing password', username: users.standard.username, password: '', error: 'Password is required' },
  ];

  for (const attempt of invalidAttempts) {
    test(`rejects ${attempt.name}`, async ({ loginPage, page }) => {
      await loginPage.login(attempt.username, attempt.password);
      await loginPage.expectError(attempt.error);
      await expect(page).not.toHaveURL(/inventory\.html/);
    });
  }
});
