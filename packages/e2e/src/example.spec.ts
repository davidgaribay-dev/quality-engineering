import { test, expect } from '@playwright/test';

// Placeholder smoke test that runs without an app under test.
// Once you set BASE_URL (or a webServer in playwright.config.ts), switch
// page.goto('/') to your app and assert on real content.
test('playwright is wired up', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/Playwright/);
});
