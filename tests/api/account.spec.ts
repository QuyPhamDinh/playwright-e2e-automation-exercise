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

  test('TC05 rejects authentication when email is omitted', async ({ apiClient }) => {
    const response = await apiClient.verifyLoginWithoutEmail('TestOnly!4829');

    expect(response.responseCode).toBe(400);
    expect(response.message).toBe(
      'Bad request, email or password parameter is missing in POST request.',
    );
  });

  test('TC06 rejects an unsupported authentication method', async ({ apiClient }) => {
    const response = await apiClient.deleteVerifyLogin();

    expect(response.responseCode).toBe(405);
    expect(response.message).toBe('This request method is not supported.');
  });

  test('TC07 deletes an account and prevents subsequent authentication', async ({
    account,
    apiClient,
    markAccountDeleted,
  }) => {
    const validAuthentication = await apiClient.verifyLogin(account.email, account.password);
    expect(validAuthentication.responseCode).toBe(200);

    const deletion = await apiClient.delete(account);
    expect(deletion.responseCode).toBe(200);
    expect(deletion.message).toBe('Account deleted!');
    markAccountDeleted();

    const authentication = await apiClient.verifyLogin(account.email, account.password);
    expect(authentication.responseCode).toBe(404);
    expect(authentication.message).toBe('User not found!');
  });
});
