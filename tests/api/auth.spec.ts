import { test, expect } from '@playwright/test';
import { env } from '../../src/config/env';

test.describe('Auth API', () => {
  test('valid credentials return a token', { tag: '@smoke' }, async ({ request }) => {
    const response = await request.post('/auth', {
      data: { username: env.apiUser, password: env.apiPassword },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(typeof body.token).toBe('string');
    expect(body.token.length).toBeGreaterThan(5);
  });

  test('bad credentials return no token', async ({ request }) => {
    const response = await request.post('/auth', {
      data: { username: env.apiUser, password: 'wrong-password' },
    });
    // Restful-Booker reports bad credentials with a 200 and a reason, not a 401.
    const body = await response.json();
    expect(body.token).toBeUndefined();
    expect(body.reason).toBe('Bad credentials');
  });
});
