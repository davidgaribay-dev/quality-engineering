import type { Species } from '@org/contracts';

/**
 * Known expectations about the API's seed catalog (7 pets: 4 dogs, 3 cats).
 * Centralised so data-driven specs assert against one source of truth.
 */
export const CATALOG = {
  total: 7,
  bySpecies: { dog: 4, cat: 3 } satisfies Record<Species, number>,
} as const;

/** Representative pet ids for happy/negative paths. */
export const SAMPLE_PETS = {
  /** Adoptable — adopt button is enabled. */
  available: 'biscuit',
  /** status === 'pending' — still allows "request more info". */
  pending: 'coco',
  /** Not in the catalog — expect 404 / route error. */
  missing: 'does-not-exist',
} as const;

/** Data-driven species filter cases (UI grid + API list). */
export const SPECIES_CASES: { species: Species; expectedCount: number }[] = [
  { species: 'dog', expectedCount: CATALOG.bySpecies.dog },
  { species: 'cat', expectedCount: CATALOG.bySpecies.cat },
];
