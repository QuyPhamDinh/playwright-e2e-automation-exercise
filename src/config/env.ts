/** Automation Exercise targets by default; override with environment variables. */
export const env = {
  uiBaseUrl: process.env.UI_BASE_URL ?? 'https://automationexercise.com',
  apiBaseUrl: process.env.API_BASE_URL ?? 'https://automationexercise.com/api/',
};
