import { defineConfig, devices } from '@playwright/test';
import { env } from './src/support/env.js';

/**
 * Playwright config for the @org/e2e SDET framework.
 * Docs: https://playwright.dev/docs/test-configuration
 *
 * Projects: a `setup` health-gate → then `api` (no browser, hits the API) and
 * `ui-chromium` (the SPA). Both `webServer` entries boot the stack first, so
 * `npx playwright test` works from a clean checkout with nothing running.
 */
export default defineConfig({
  testDir: './src',
  fullyParallel: true,
  forbidOnly: env.isCI,
  retries: env.isCI ? 2 : 0,

  // CI: machine-readable + mergeable; local: fast list + browsable HTML.
  reporter: env.isCI
    ? [['blob'], ['junit', { outputFile: 'test-output/junit.xml' }], ['github']]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    testIdAttribute: 'data-testid',
  },

  // Boot BOTH servers before tests. cwd is the repo root so the commands are
  // tooling-agnostic (work on the Mac host, in the devcontainer, and in CI —
  // independent of the Nx CLI). Playwright waits for each `url` to answer 2xx/3xx.
  webServer: [
    {
      command: 'npm run start --workspace=@org/api',
      url: `${env.apiURL}/health`,
      cwd: '../..',
      timeout: 120_000,
      reuseExistingServer: !env.isCI,
    },
    {
      command: 'npm run serve --workspace=@org/web',
      url: env.baseURL,
      cwd: '../..',
      timeout: 120_000,
      reuseExistingServer: !env.isCI,
    },
  ],

  projects: [
    // Gate the suite on a healthy stack; api + ui depend on it.
    { name: 'setup', testMatch: /global\.setup\.ts/ },

    // Pure API tests — no browser. baseURL points at the Hono API.
    {
      name: 'api',
      testMatch: 'tests/api/**/*.spec.ts',
      use: { baseURL: env.apiURL },
      dependencies: ['setup'],
    },

    // UI tests against the SPA in Chromium (chosen browser scope).
    {
      name: 'ui-chromium',
      testMatch: 'tests/ui/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'], baseURL: env.baseURL },
      dependencies: ['setup'],
    },
  ],
});
