import AxeBuilder from '@axe-core/playwright';
import type { Page, TestInfo } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/**
 * Runs axe on the current page, attaches the full result to the test report,
 * and returns only the serious/critical violations that should fail the build.
 */
export async function findBlockingViolations(page: Page, testInfo: TestInfo) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

  await testInfo.attach('axe-violations.json', {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });

  return results.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length }));
}
