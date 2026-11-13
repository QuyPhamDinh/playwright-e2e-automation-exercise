import { defineConfig, devices } from '@playwright/test';
import { AUTH_FILE, env } from './src/config/env';

const isCI = !!process.env.CI;
const isJenkins = process.env.JENKINS === 'true';

export default defineConfig({
  testDir: './tests',
  globalSetup: './src/config/global-setup.ts',

  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' },
  },

  // Jenkins publishes JUnit and the HTML report directly from the workspace.
  // GitHub Actions keeps its blob reports so the workflow can merge CI shards.
  reporter: isJenkins
    ? [
        ['junit', { outputFile: 'test-results/junit.xml' }],
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['list'],
      ]
    : isCI
      ? [['blob'], ['list'], ['github']]
      : [['list'], ['html', { open: 'never' }]],

  // Baselines are generated in the Linux Playwright container, so no OS suffix is needed.
  snapshotPathTemplate: 'tests/__screenshots__/{testFilePath}/{arg}-{projectName}{ext}',

  use: {
    baseURL: env.uiBaseUrl,
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Cross-browser UI regression, authenticated by global setup.
    {
      name: 'chromium',
      testMatch: /ui\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
    },
    {
      name: 'firefox',
      testMatch: /ui\/.*\.spec\.ts/,
      use: { ...devices['Desktop Firefox'], storageState: AUTH_FILE },
    },
    {
      name: 'webkit',
      testMatch: /ui\/.*\.spec\.ts/,
      use: { ...devices['Desktop Safari'], storageState: AUTH_FILE },
    },

    // API tests: no browser needed.
    {
      name: 'api',
      testMatch: /api\/.*\.spec\.ts/,
      use: {
        baseURL: env.apiBaseUrl,
        extraHTTPHeaders: { Accept: 'application/json' },
        trace: 'retain-on-failure',
      },
    },

    // Accessibility (axe) and visual regression run in Chromium only.
    {
      name: 'a11y',
      testMatch: /a11y\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'visual',
      testMatch: /visual\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
