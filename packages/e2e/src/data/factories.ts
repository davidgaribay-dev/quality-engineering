import { faker } from '@faker-js/faker';
import { InquirySchema, type Inquiry, type RequestType } from '@org/contracts';
import type { InquiryFormInput } from '../pages/adopt.page.js';

/** Phone shaped to satisfy the contract regex `/^[0-9+()\-\s]{7,}$/`. */
function syntheticPhone(): string {
  return `+1 (${faker.string.numeric(3)}) ${faker.string.numeric(3)}-${faker.string.numeric(4)}`;
}

/**
 * Synthetic, schema-valid inquiry payload. Each call produces fresh fake data
 * (different applicant every run) and is validated against `InquirySchema` so a
 * factory can never silently drift out of contract. Pass `overrides` to pin
 * specific fields for a given test.
 */
export function makeInquiry(overrides: Partial<Inquiry> = {}): Inquiry {
  const inquiry: Inquiry = {
    requestType: 'adopt',
    fullName: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    phone: syntheticPhone(),
    householdType: faker.helpers.arrayElement(['house', 'apartment', 'other']),
    hasOtherPets: faker.datatype.boolean(),
    message: faker.lorem.sentence(),
    ...overrides,
  };
  // Fail fast in the factory rather than later in the request.
  return InquirySchema.parse(inquiry);
}

/** Convenience: a `more-info` request variant. */
export function makeInfoRequest(overrides: Partial<Inquiry> = {}): Inquiry {
  return makeInquiry({ requestType: 'more-info' as RequestType, ...overrides });
}

/** The visible (fillable) subset of a synthetic inquiry, for UI form tests. */
export function makeInquiryFormInput(overrides: Partial<Inquiry> = {}): InquiryFormInput {
  const i = makeInquiry(overrides);
  return {
    fullName: i.fullName,
    email: i.email,
    phone: i.phone,
    householdType: i.householdType,
    hasOtherPets: i.hasOtherPets,
    message: i.message,
  };
}
