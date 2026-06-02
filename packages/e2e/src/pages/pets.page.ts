import { expect, type Locator } from '@playwright/test';
import type { Species } from '@org/contracts';
import { BasePage } from './base.page.js';

type Filter = 'all' | Species;

/** Catalog page (`/pets`) — species filter + responsive card grid. */
export class PetsPage extends BasePage {
  readonly root: Locator = this.byTestId('pets-page');
  readonly grid: Locator = this.byTestId('pet-grid');
  readonly cards: Locator = this.byTestId('pet-card');
  readonly count: Locator = this.byTestId('pets-count');
  readonly empty: Locator = this.byTestId('pets-empty');
  readonly filter: Locator = this.byTestId('species-filter');

  async open(species?: Species): Promise<void> {
    await this.goto(species ? `/pets?species=${species}` : '/pets');
    await expect(this.root).toBeVisible();
  }

  /** Click a segment of the species filter (drives the `?species=` query). */
  async filterBy(value: Filter): Promise<void> {
    this.log.info(`filter pets by: ${value}`);
    await this.byTestId(`species-filter-${value}`).click();
  }

  /** Number of pet cards currently rendered. */
  cardCount(): Promise<number> {
    return this.cards.count();
  }

  /** A single card by pet id (disambiguated via data-pet-id, not text). */
  card(petId: string): Locator {
    return this.cards.filter({ has: this.page.locator(`[data-pet-id="${petId}"]`) });
  }

  /** Open a pet's detail page by clicking its card. */
  async openPet(petId: string): Promise<void> {
    await this.cards.filter({ has: this.page.locator(`[data-pet-id="${petId}"]`) }).click();
  }

  /** Open the first card in the grid. */
  async openFirstPet(): Promise<void> {
    await this.cards.first().click();
  }

  /** Assert every visible card matches the given species (via data-species). */
  async expectAllCardsAreSpecies(species: Species): Promise<void> {
    const count = await this.cardCount();
    for (let i = 0; i < count; i++) {
      await expect(this.cards.nth(i)).toHaveAttribute('data-species', species);
    }
  }
}
