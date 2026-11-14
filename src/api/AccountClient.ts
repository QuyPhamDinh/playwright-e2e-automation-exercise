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

export type AccountResponse = {
  responseCode: number;
  message: string;
};

export type UserDetails = {
  id: number;
  name: string;
  email: string;
  title: string;
  birth_day: string;
  birth_month: string;
  birth_year: string;
  first_name: string;
  last_name: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
};

export type UserDetailResponse = {
  responseCode: number;
  user: UserDetails;
};

function isAccountResponse(value: unknown): value is AccountResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).responseCode === 'number' &&
    typeof (value as Record<string, unknown>).message === 'string'
  );
}

function isUserDetails(value: unknown): value is UserDetails {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const user = value as Record<string, unknown>;
  return (
    typeof user.id === 'number' &&
    typeof user.name === 'string' &&
    typeof user.email === 'string' &&
    typeof user.title === 'string' &&
    typeof user.birth_day === 'string' &&
    typeof user.birth_month === 'string' &&
    typeof user.birth_year === 'string' &&
    typeof user.first_name === 'string' &&
    typeof user.last_name === 'string' &&
    typeof user.company === 'string' &&
    typeof user.address1 === 'string' &&
    typeof user.address2 === 'string' &&
    typeof user.country === 'string' &&
    typeof user.state === 'string' &&
    typeof user.city === 'string' &&
    typeof user.zipcode === 'string'
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

async function readUserDetailResponse(response: APIResponse): Promise<UserDetailResponse> {
  const body: unknown = await response.json();
  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as Record<string, unknown>).responseCode !== 'number' ||
    !isUserDetails((body as Record<string, unknown>).user)
  ) {
    throw new Error(
      `Automation Exercise returned an invalid user detail response (HTTP ${response.status()})`,
    );
  }
  return body as UserDetailResponse;
}

export class AccountClient {
  constructor(private readonly request: APIRequestContext) {}

  async create(account: Account): Promise<AccountResponse> {
    const response = await this.request.post('createAccount', { form: formData(account) });
    expect(response.status(), 'account creation HTTP status').toBe(200);
    const body = await readResponse(response);
    expect(body.responseCode, 'account creation application response code').toBe(201);
    expect(body.message, 'account creation message').toBe('User created!');
    return body;
  }

  async getUserDetailByEmail(email: string): Promise<UserDetailResponse> {
    const response = await this.request.get('getUserDetailByEmail', { params: { email } });
    expect(response.status(), 'user detail HTTP status').toBe(200);
    return readUserDetailResponse(response);
  }

  async verifyLogin(email: string, password: string): Promise<AccountResponse> {
    const response = await this.request.post('verifyLogin', {
      form: { email, password },
    });
    expect(response.status(), 'verify login HTTP status').toBe(200);
    return readResponse(response);
  }

  async delete(account: Pick<Account, 'email' | 'password'>): Promise<AccountResponse> {
    const response = await this.request.delete('deleteAccount', {
      form: { email: account.email, password: account.password },
    });
    expect(response.status(), 'account deletion HTTP status').toBe(200);
    const body = await readResponse(response);
    expect(body.responseCode, 'account deletion application response code').toBe(200);
    expect(body.message, 'account deletion message').toBe('Account deleted!');
    return body;
  }
}
