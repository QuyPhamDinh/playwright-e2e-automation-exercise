import { expect, type APIRequestContext, type APIResponse } from '@playwright/test';

export type Account = {
  name: string;
  email: string;
  password: string;
  title: 'Mr' | 'Mrs' | 'Miss';
  birth_date: string;
  birth_month: string;
  birth_year: string;
  firstname: string;
  lastname: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  zipcode: string;
  state: string;
  city: string;
  mobile_number: string;
};

type AccountResponse = {
  responseCode: number;
  message: string;
};

function isAccountResponse(value: unknown): value is AccountResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).responseCode === 'number' &&
    typeof (value as Record<string, unknown>).message === 'string'
  );
}

function formData(account: Account): Record<string, string> {
  return { ...account };
}

async function readResponse(response: APIResponse): Promise<AccountResponse> {
  const body: unknown = await response.json();
  if (!isAccountResponse(body)) {
    throw new Error(`Automation Exercise returned an invalid account response (HTTP ${response.status()})`);
  }
  return body;
}

export class AccountClient {
  constructor(private readonly request: APIRequestContext) {}

  async create(account: Account): Promise<void> {
    const response = await this.request.post('createAccount', { form: formData(account) });
    expect(response.status(), 'account creation HTTP status').toBe(200);
    const body = await readResponse(response);
    expect(body.responseCode, 'account creation application response code').toBe(201);
    expect(body.message, 'account creation message').toBe('User created!');
  }

  async delete(account: Pick<Account, 'email' | 'password'>): Promise<void> {
    const response = await this.request.delete('deleteAccount', {
      form: { email: account.email, password: account.password },
    });
    expect(response.status(), 'account deletion HTTP status').toBe(200);
    const body = await readResponse(response);
    expect(body.responseCode, 'account deletion application response code').toBe(200);
    expect(body.message, 'account deletion message').toBe('Account deleted!');
  }
}
