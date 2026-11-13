import { test, expect } from '../../src/fixtures';
import { AUTH_FILE } from '../../src/config/env';
import { findBlockingViolations } from '../../src/utils/a11y';

// Add rule ids here only while a known issue is being fixed, with a comment explaining why.
const ALLOWED_RULES: string[] = [];

test.describe('Accessibility (axe, WCAG A/AA)', () => {
  test.describe('logged out', () => {
    test('login page has no serious or critical violations', async ({ loginPage, page }, testInfo) => {
      await loginPage.goto();
      const violations = await findBlockingViolations(page, testInfo, { allowedRules: ALLOWED_RULES });
      expect(violations).toEqual([]);
    });
  });

  test.describe('logged in', () => {
    test.use({ storageState: AUTH_FILE });

    test('product list has no serious or critical violations', async ({ inventoryPage, page }, testInfo) => {
      await inventoryPage.open();
      const violations = await findBlockingViolations(page, testInfo, { allowedRules: ALLOWED_RULES });
      expect(violations).toEqual([]);
    });
  });
});
