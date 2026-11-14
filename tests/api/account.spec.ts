import { test, expect } from '../../src/fixtures';
import { buildAccount } from '../../src/data/accountFactory';

test.describe('Automation Exercise account API', () => {
  test('TC01 creates, retrieves, and authenticates a valid account', async ({ account, apiClient }) => {
    const details = await apiClient.getUserDetailByEmail(account.email);
    expect(details.responseCode).toBe(200);
    expect(details.user.name).toBe(account.name);
    expect(details.user.email).toBe(account.email);

    const authentication = await apiClient.verifyLogin(account.email, account.password);
    expect(authentication.responseCode).toBe(200);
    expect(authentication.message).toBe('User exists!');
  });

  test('TC02 authenticates with valid credentials', async ({ account, apiClient }) => {
    const authentication = await apiClient.verifyLogin(account.email, account.password);
    expect(authentication.responseCode).toBe(200);
    expect(authentication.message).toBe('User exists!');
  });

  test('TC03 rejects an incorrect password without invalidating the account', async ({ account, apiClient }) => {
    const invalidAuthentication = await apiClient.verifyLogin(
      account.email,
      `${account.password}-wrong`,
    );
    expect(invalidAuthentication.responseCode).toBe(404);
    expect(invalidAuthentication.message).toBe('User not found!');

    const validAuthentication = await apiClient.verifyLogin(account.email, account.password);
    expect(validAuthentication.responseCode).toBe(200);
    expect(validAuthentication.message).toBe('User exists!');
  });

  test('TC04 rejects an unregistered email', async ({ apiClient }) => {
    const unregisteredAccount = buildAccount();
    const authentication = await apiClient.verifyLogin(
      unregisteredAccount.email,
      unregisteredAccount.password,
    );

    expect(authentication.responseCode).toBe(404);
    expect(authentication.message).toBe('User not found!');
  });
});
