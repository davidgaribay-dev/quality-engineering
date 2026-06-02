import { test, expect } from '../../support/fixtures.js';
import { CATALOG, SAMPLE_PETS, SPECIES_CASES } from '../../data/pets.dataset.js';

test.describe('API · pets', { tag: ['@api'] }, () => {
  test('GET /api/pets returns the full validated catalog', { tag: ['@smoke'] }, async ({ api }) => {
    const pets = await api.listPets(); // ApiClient validates against PetListSchema
    expect(pets).toHaveLength(CATALOG.total);
  });

  // Data-driven: one test per species, asserting count + homogeneity.
  for (const { species, expectedCount } of SPECIES_CASES) {
    test(`GET /api/pets?species=${species} returns only ${species}s`, { tag: ['@regression'] }, async ({ api }) => {
      const pets = await api.listPets(species);
      expect(pets).toHaveLength(expectedCount);
      expect(pets.every((p) => p.species === species)).toBe(true);
    });
  }

  test('GET /api/pets/:id returns the requested pet', { tag: ['@smoke'] }, async ({ api }) => {
    const pet = await api.getPet(SAMPLE_PETS.available);
    expect(pet.id).toBe(SAMPLE_PETS.available);
    expect(pet.imageUrl).toMatch(/^\/images\//);
  });

  test('GET /api/pets/:id 404s for an unknown id', { tag: ['@regression'] }, async ({ api }) => {
    const res = await api.getPetResponse(SAMPLE_PETS.missing);
    expect(res.status()).toBe(404);
    expect(await res.json()).toMatchObject({ error: expect.any(String) });
  });
});
