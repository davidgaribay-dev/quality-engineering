import { expect, type Locator } from '@playwright/test';
import { BasePage } from './base.page.js';

/** Landing page (`/`) — hero with CTAs into the catalog. */
export class HomePage extends BasePage {
  readonly root: Locator = this.byTestId('home-page');
  readonly browseCta: Locator = this.byTestId('hero-browse');
  readonly dogsCta: Locator = this.byTestId('hero-dogs');
  readonly catsCta: Locator = this.byTestId('hero-cats');

  async open(): Promise<void> {
    await this.goto('/');
    await expect(this.root).toBeVisible();
  }

  async browseAllPets(): Promise<void> {
    await this.browseCta.click();
  }

  async browseDogs(): Promise<void> {
    await this.dogsCta.click();
  }

  async browseCats(): Promise<void> {
    await this.catsCta.click();
  }
}
