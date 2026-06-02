import { test, expect } from '../../support/fixtures.js';

/**
 * Critical-path smoke: the app loads and a user can get from the landing page
 * to a pet's detail. Kept deliberately small so it's a fast PR gate.
 */
test.describe('UI · smoke', { tag: ['@smoke'] }, () => {
  test('landing → catalog → pet detail', async ({ home, pets, petDetail }) => {
    await home.open();
    await home.browseAllPets();

    await expect(pets.root).toBeVisible();
    await expect(pets.cards.first()).toBeVisible();
    await pets.openFirstPet();

    await expect(petDetail.root).toBeVisible();
    await expect(petDetail.name).toBeVisible();
    await expect(petDetail.adoptButton).toBeVisible();
  });
});
