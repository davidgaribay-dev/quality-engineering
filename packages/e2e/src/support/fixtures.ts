import { test as base, request as playwrightRequest, type APIRequestContext } from '@playwright/test';
import { env } from './env.js';
import { logger, type Logger } from './logger.js';
import { ApiClient } from './api-client.js';
import { HomePage } from '../pages/home.page.js';
import { PetsPage } from '../pages/pets.page.js';
import { PetDetailPage } from '../pages/pet-detail.page.js';
import { AdoptPage } from '../pages/adopt.page.js';

export interface TestFixtures {
  /** Per-test child logger, auto-started (logs start/finish + status). */
  log: Logger;
  /** Typed, zod-validating API client pointed at the API base URL. */
  api: ApiClient;
  home: HomePage;
  pets: PetsPage;
  petDetail: PetDetailPage;
  adopt: AdoptPage;
}

export const test = base.extend<TestFixtures>({
  // Auto fixture: every test gets a contextual logger and start/finish lines —
  // this is the "hooks + per-test context" wiring. `auto: true` runs it even
  // for tests that don't reference `log`.
  log: [
    async ({}, use, testInfo) => {
      const log = logger.child({ test: testInfo.title });
      log.info('▶ test started', { project: testInfo.project.name, tags: testInfo.tags });
      await use(log);
      log.info(`■ test finished: ${testInfo.status}`, {
        durationMs: testInfo.duration,
        ...(testInfo.error ? { error: testInfo.error.message } : {}),
      });
    },
    { auto: true },
  ],

  // Dedicated API request context (always the API base URL, regardless of the
  // project's page baseURL), disposed on teardown.
  api: async ({ log }, use) => {
    const ctx: APIRequestContext = await playwrightRequest.newContext({
      baseURL: env.apiURL,
    });
    await use(new ApiClient(ctx, log));
    await ctx.dispose();
  },

  home: async ({ page, log }, use) => {
    await use(new HomePage(page, log));
  },
  pets: async ({ page, log }, use) => {
    await use(new PetsPage(page, log));
  },
  petDetail: async ({ page, log }, use) => {
    await use(new PetDetailPage(page, log));
  },
  adopt: async ({ page, log }, use) => {
    await use(new AdoptPage(page, log));
  },
});

export { expect } from '@playwright/test';
