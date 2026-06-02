/**
 * Centralised, defaulted environment config so specs and config never read
 * `process.env` directly. Defaults match the local dev ports (api :3333,
 * web :4200) so the suite runs with zero setup; CI/Docker override via env.
 */
export const env = {
  /** Web SPA under test — Playwright `baseURL` for the ui project. */
  baseURL: process.env['BASE_URL'] ?? 'http://localhost:4200',
  /** Hono API base — used by the api project and the ApiClient fixture. */
  apiURL: process.env['API_URL'] ?? 'http://localhost:3333',
  /** Winston level; see support/logger.ts. */
  logLevel: process.env['LOG_LEVEL'] ?? 'info',
  /** True inside CI (GitHub Actions sets CI=true). */
  isCI: !!process.env['CI'],
} as const;
