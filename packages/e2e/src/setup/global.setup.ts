import { test as setup, expect, request } from '@playwright/test';
import { env } from '../support/env.js';
import { logger } from '../support/logger.js';

/**
 * Setup project (a dependency of the api + ui projects, see playwright.config).
 * Playwright's `webServer` already waits for both servers to boot; this gates
 * the run on a real `/health` 200 + a reachable SPA, and logs the resolved
 * environment so every report header documents what was tested.
 */
setup('stack is healthy', async () => {
  logger.info('environment', { baseURL: env.baseURL, apiURL: env.apiURL, ci: env.isCI });

  const api = await request.newContext({ baseURL: env.apiURL });
  const health = await api.get('/health');
  await expect(health, 'API /health should be 200').toBeOK();
  expect(await health.json()).toEqual({ status: 'ok' });
  await api.dispose();
  logger.info('API is healthy');

  const web = await request.newContext({ baseURL: env.baseURL });
  const home = await web.get('/');
  await expect(home, 'web SPA should respond').toBeOK();
  await web.dispose();
  logger.info('web SPA is reachable');
});
