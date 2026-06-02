import { test, expect } from '../../support/fixtures.js';
import { makeInquiryFormInput } from '../../data/factories.js';
import { SAMPLE_PETS } from '../../data/pets.dataset.js';

test.describe('UI · adoption flow', { tag: ['@regression'] }, () => {
  test('submit an adoption request from a pet detail page', { tag: ['@smoke'] }, async ({ petDetail, adopt, log }) => {
    await petDetail.open(SAMPLE_PETS.available);
    await petDetail.startAdoption();

    await expect(adopt.heading).toBeVisible();
    const form = makeInquiryFormInput(); // synthetic applicant, different each run
    log.info('submitting adoption inquiry', { email: form.email });
    await adopt.complete(form);

    const reference = await adopt.expectSuccess();
    expect(reference).not.toBe('');
  });

  test('submit a "request more info" inquiry for a pending pet', async ({ petDetail, adopt }) => {
    await petDetail.open(SAMPLE_PETS.pending);
    await petDetail.requestMoreInfo();

    await expect(adopt.heading).toBeVisible();
    await adopt.complete(makeInquiryFormInput());

    const reference = await adopt.expectSuccess();
    expect(reference).not.toBe('');
  });
});
