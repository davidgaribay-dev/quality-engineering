import { test, expect } from '../../support/fixtures.js';
import type { InquiryFormInput } from '../../pages/adopt.page.js';
import { makeInquiryFormInput } from '../../data/factories.js';
import { SAMPLE_PETS } from '../../data/pets.dataset.js';
import { FIELD_VALIDATION_CASES } from '../../data/inquiry-validation.dataset.js';

test.describe('UI · inquiry form validation', { tag: ['@regression'] }, () => {
  // Data-driven: start from a valid synthetic form, corrupt ONE field, submit,
  // and assert the matching inline error shows (and the form did not succeed).
  for (const { name, field, value, expectedError } of FIELD_VALIDATION_CASES) {
    test(`shows an error when ${name}`, async ({ adopt }) => {
      await adopt.open(SAMPLE_PETS.available);

      const input: InquiryFormInput = { ...makeInquiryFormInput(), [field]: value };
      await adopt.complete(input);

      await expect(adopt.fieldError(expectedError)).toBeVisible();
      await expect(adopt.success).toBeHidden();
    });
  }

  test('a fully valid form has no field errors', { tag: ['@smoke'] }, async ({ adopt }) => {
    await adopt.open(SAMPLE_PETS.available);
    await adopt.complete(makeInquiryFormInput());
    await expect(adopt.success).toBeVisible();
  });
});
