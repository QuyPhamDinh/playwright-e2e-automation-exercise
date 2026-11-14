import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly formRegion: Locator;
  readonly loggedInAs: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByTestId('login-email');
    this.passwordInput = page.getByTestId('login-password');
    this.loginButton = page.getByTestId('login-button');
    this.formRegion = page.locator('#form .container');
    this.loggedInAs = page.locator('a').filter({ hasText: 'Logged in as' });
    this.logoutLink = page.getByText('Logout', { exact: true });
  }

  async goto(): Promise<void> {
    await super.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectLoggedInAs(name: string): Promise<void> {
    await expect(this.loggedInAs).toContainText(`Logged in as ${name}`);
  }

  async expectLogoutVisible(): Promise<void> {
    await expect(this.logoutLink).toBeVisible();
  }
}
