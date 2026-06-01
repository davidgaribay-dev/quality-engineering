import {
  InquiryResponseSchema,
  PetListSchema,
  PetSchema,
  type Inquiry,
  type InquiryResponse,
  type Pet,
  type Species,
} from '@org/contracts';

/** Fetch the catalog, optionally filtered to dogs or cats. */
export async function fetchPets(species?: Species): Promise<Pet[]> {
  const query = species ? `?species=${species}` : '';
  const res = await fetch(`/api/pets${query}`);
  if (!res.ok) throw new Error('Failed to load pets');
  return PetListSchema.parse(await res.json());
}

/** Fetch a single pet; throws a 404 Response that the route error boundary renders. */
export async function fetchPet(id: string): Promise<Pet> {
  const res = await fetch(`/api/pets/${id}`);
  if (res.status === 404) {
    throw new Response('Pet not found', { status: 404 });
  }
  if (!res.ok) throw new Error('Failed to load pet');
  return PetSchema.parse(await res.json());
}

/** Submit an adoption / more-info inquiry for a pet. */
export async function submitInquiry(
  petId: string,
  payload: Inquiry
): Promise<InquiryResponse> {
  const res = await fetch(`/api/pets/${petId}/inquiries`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to submit your request');
  return InquiryResponseSchema.parse(await res.json());
}
