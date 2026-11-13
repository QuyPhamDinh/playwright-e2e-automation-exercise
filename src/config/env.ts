import path from 'node:path';

/** Public demo targets by default; override with environment variables. */
export const env = {
  uiBaseUrl: process.env.UI_BASE_URL ?? 'https://www.saucedemo.com',
  apiBaseUrl: process.env.API_BASE_URL ?? 'https://restful-booker.herokuapp.com',
  apiUser: process.env.API_USER ?? 'admin',
  apiPassword: process.env.API_PASSWORD ?? 'password123',
};

/** Where the logged-in browser session is saved by global setup. */
export const AUTH_FILE = path.resolve(process.cwd(), '.auth', 'standard-user.json');
