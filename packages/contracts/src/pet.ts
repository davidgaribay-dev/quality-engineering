import { z } from 'zod';

/** A pet is either a dog or a cat in this adoption catalog. */
export const Species = z.enum(['dog', 'cat']);
export type Species = z.infer<typeof Species>;

export const Gender = z.enum(['male', 'female']);
export type Gender = z.infer<typeof Gender>;

export const Size = z.enum(['small', 'medium', 'large']);
export type Size = z.infer<typeof Size>;

/** Adoption lifecycle status shown as a badge in the UI. */
export const PetStatus = z.enum(['available', 'pending', 'adopted']);
export type PetStatus = z.infer<typeof PetStatus>;

export const PetSchema = z.object({
  id: z.string(),
  name: z.string(),
  species: Species,
  breed: z.string(),
  ageYears: z.number().nonnegative(),
  gender: Gender,
  size: Size,
  /** Short tagline shown on the card. */
  tagline: z.string(),
  /** Long-form description shown on the detail page. */
  description: z.string(),
  traits: z.array(z.string()),
  goodWith: z.array(z.string()),
  location: z.string(),
  /** Relative path served by the API, e.g. "/images/dog-biscuit.jpg". */
  imageUrl: z.string(),
  status: PetStatus,
});
export type Pet = z.infer<typeof PetSchema>;

export const PetListSchema = z.array(PetSchema);
export type PetList = z.infer<typeof PetListSchema>;

/** Query params accepted by `GET /api/pets`. */
export const PetQuerySchema = z.object({
  species: Species.optional(),
});
export type PetQuery = z.infer<typeof PetQuerySchema>;
