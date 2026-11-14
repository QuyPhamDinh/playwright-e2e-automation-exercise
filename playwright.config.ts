import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';

const isCI = ['true', '1'].includes((process.env.CI ?? '').toLowerCase());
const isJenkins = process.env.JENKINS === 'true';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    // Repeated matched-container comparisons produced zero differing pixels.
    toHaveScreenshot: { maxDiffPixels: 0, animations: 'disabled' },
  },
  snapshotPathTemplate: 'tests/__screenshots__/{testFilePath}/{arg}-{projectName}{ext}',

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

  use: {
    baseURL: env.uiBaseUrl,
    testIdAttribute: 'data-qa',
    storageState: { cookies: [], origins: [] },
    viewport: { width: 1280, height: 720 },
    locale: 'en-US',
    timezoneId: 'America/Los_Angeles',
    colorScheme: 'light',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'api',
      testMatch: /api\/.*\.spec\.ts/,
    },
    {
      name: 'chromium',
      testMatch: /ui\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testMatch: /ui\/.*\.spec\.ts/,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testMatch: /ui\/.*\.spec\.ts/,
      use: { ...devices['Desktop Safari'] },
    },
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
