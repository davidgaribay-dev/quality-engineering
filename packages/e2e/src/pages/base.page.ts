import { type Locator, type Page } from '@playwright/test';
import type { Logger } from '../support/logger.js';

/**
 * Shared base for every Page Object. Holds the Playwright `page` + the per-test
 * logger, and centralises the testid locator helper so concrete pages stay
 * declarative. Locators are exposed as `getByTestId` against the app's stable
 * `data-testid` hooks — never CSS/text — per Playwright best practices.
 */
export abstract class BasePage {
  constructor(
    protected readonly page: Page,
    protected readonly log: Logger
  ) {}

  /** Locate by the app's `data-testid` convention. */
  protected byTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  /** Navigate to a path relative to the project baseURL. */
  protected async goto(path: string): Promise<void> {
    this.log.debug(`navigate → ${path}`);
    await this.page.goto(path);
  }
}
