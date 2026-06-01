import type { PetStatus, Species } from '@org/contracts';

/** "6 months" / "1 year" / "3 years" from a fractional age in years. */
export function formatAge(ageYears: number): string {
  if (ageYears < 1) {
    const months = Math.max(1, Math.round(ageYears * 12));
    return `${months} month${months === 1 ? '' : 's'}`;
  }
  const years = Math.round(ageYears);
  return `${years} year${years === 1 ? '' : 's'}`;
}

export const speciesEmoji: Record<Species, string> = {
  dog: '🐶',
  cat: '🐱',
};

export const speciesLabel: Record<Species, string> = {
  dog: 'Dog',
  cat: 'Cat',
};

export const statusLabel: Record<PetStatus, string> = {
  available: 'Available',
  pending: 'Adoption pending',
  adopted: 'Adopted',
};

export const statusVariant: Record<PetStatus, 'success' | 'warning' | 'muted'> = {
  available: 'success',
  pending: 'warning',
  adopted: 'muted',
};
