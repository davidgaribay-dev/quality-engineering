import { test, expect } from '../../support/fixtures.js';
import { CATALOG, SPECIES_CASES } from '../../data/pets.dataset.js';

test.describe('UI · browse & filter', { tag: ['@regression'] }, () => {
  test.beforeEach(async ({ pets }) => {
    await pets.open();
  });

  test('shows the full catalog by default', async ({ pets }) => {
    await expect(pets.cards).toHaveCount(CATALOG.total);
    await expect(pets.count).toContainText(String(CATALOG.total));
  });

  // Data-driven: one test per species — count + homogeneity + URL query.
  for (const { species, expectedCount } of SPECIES_CASES) {
    test(`filtering by ${species} shows only ${species}s`, async ({ pets, page }) => {
      await pets.filterBy(species);

      await expect(page).toHaveURL(new RegExp(`[?&]species=${species}`));
      await expect(pets.cards).toHaveCount(expectedCount);
      await pets.expectAllCardsAreSpecies(species);
    });
  }

  test('returning to "All pets" restores the full catalog', async ({ pets }) => {
    await pets.filterBy('dog');
    await expect(pets.cards).toHaveCount(CATALOG.bySpecies.dog);
    await pets.filterBy('all');
    await expect(pets.cards).toHaveCount(CATALOG.total);
  });
});
