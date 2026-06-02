import type { Inquiry } from '@org/contracts';
import type { InquiryFormInput } from '../pages/adopt.page.js';

/**
 * UI validation cases: each takes a valid baseline form input and corrupts ONE
 * field, expecting that field's inline `inquiry-error-<field>` to appear. The
 * spec supplies the valid baseline (from the faker factory) and applies these.
 */
export interface FieldValidationCase {
  name: string;
  /** Field to override on the otherwise-valid form input. */
  field: keyof InquiryFormInput;
  /** Invalid value to set. */
  value: string | boolean;
  /** Expected error testid suffix (`inquiry-error-<expectedError>`). */
  expectedError: keyof Inquiry;
}

export const FIELD_VALIDATION_CASES: FieldValidationCase[] = [
  { name: 'name too short', field: 'fullName', value: 'A', expectedError: 'fullName' },
  { name: 'name empty', field: 'fullName', value: '', expectedError: 'fullName' },
  { name: 'email malformed', field: 'email', value: 'not-an-email', expectedError: 'email' },
  { name: 'phone non-numeric', field: 'phone', value: 'call me maybe', expectedError: 'phone' },
  { name: 'message too long', field: 'message', value: 'x'.repeat(1001), expectedError: 'message' },
];

/**
 * API validation cases: each mutates a valid inquiry body into an invalid one;
 * the endpoint must answer 400. `mutate` returns `unknown` so we can also drop
 * required fields / send wrong types.
 */
export interface ApiValidationCase {
  name: string;
  mutate: (valid: Inquiry) => unknown;
}

export const API_VALIDATION_CASES: ApiValidationCase[] = [
  { name: 'empty body', mutate: () => ({}) },
  { name: 'null body', mutate: () => null },
  { name: 'missing email', mutate: ({ email: _drop, ...rest }) => rest },
  { name: 'malformed email', mutate: (v) => ({ ...v, email: 'nope' }) },
  { name: 'name too short', mutate: (v) => ({ ...v, fullName: 'A' }) },
  { name: 'unknown requestType', mutate: (v) => ({ ...v, requestType: 'purchase' }) },
  { name: 'hasOtherPets wrong type', mutate: (v) => ({ ...v, hasOtherPets: 'yes' }) },
];
