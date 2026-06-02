import { defineConfig } from 'allure';

/**
 * Allure Report 3 config for the @org/e2e suite.
 * Docs: https://allurereport.org/docs/v3/configure/
 *
 * `allure generate ./allure-results` reads the raw results emitted by the
 * allure-playwright reporter and writes the static report to ./allure-report.
 *
 * History is a single JSONL file (historyPath). Each generation reads the
 * prior file and appends one line for this run — no 20-report cap (that was
 * Allure 2). `historyLimit` is left unset = unlimited, so trends accumulate
 * indefinitely as long as CI restores history.jsonl before generating and
 * republishes it with the report (see .github/workflows/e2e.yml).
 */
export default defineConfig({
  name: 'Quality Engineering',
  output: './allure-report',

  // ── unbounded long-term history ──
  historyPath: './history.jsonl',
  appendHistory: true, // default; accumulate across runs
  // historyLimit: undefined,  // unset = unlimited (no cap)

  plugins: {
    awesome: {
      options: {
        reportName: 'Quality Engineering',
        theme: 'auto', // light | dark | auto
        groupBy: ['parentSuite', 'suite', 'subSuite'],
        stepTreeExpansion: 'expand_failed_only',
        // logo: './branding/logo.svg',  // drop a logo here to brand the header
        // ci: { type: 'github' },        // render CI run/commit links
      },
    },
  },

  // Classify failures on the report's Categories tab.
  categories: {
    rules: [
      { name: 'Product defects', matchers: { statuses: ['failed'] } },
      {
        name: 'Test infra / timeouts',
        matchers: { statuses: ['broken'], message: /timeout|ECONNREFUSED|ECONNRESET/i },
      },
    ],
  },
});
