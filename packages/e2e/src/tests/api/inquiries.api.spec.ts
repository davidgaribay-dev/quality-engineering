import { test, expect } from '../../support/fixtures.js';
import { makeInquiry, makeInfoRequest } from '../../data/factories.js';
import { SAMPLE_PETS } from '../../data/pets.dataset.js';
import { API_VALIDATION_CASES } from '../../data/inquiry-validation.dataset.js';

test.describe('API · inquiries', { tag: ['@api'] }, () => {
  test('POST a valid adoption inquiry is received', { tag: ['@smoke'] }, async ({ api }) => {
    const payload = makeInquiry(); // synthetic, schema-valid
    const res = await api.createInquiry(SAMPLE_PETS.available, payload);
    expect(res).toMatchObject({
      petId: SAMPLE_PETS.available,
      requestType: 'adopt',
      status: 'received',
    });
    expect(res.id).toBeTruthy();
    expect(() => new Date(res.submittedAt)).not.toThrow();
  });

  test('POST a more-info request is received', { tag: ['@regression'] }, async ({ api }) => {
    const res = await api.createInquiry(SAMPLE_PETS.pending, makeInfoRequest());
    expect(res.requestType).toBe('more-info');
    expect(res.petId).toBe(SAMPLE_PETS.pending);
  });

  test('POST to an unknown pet 404s', { tag: ['@regression'] }, async ({ api }) => {
    const res = await api.postInquiryResponse(SAMPLE_PETS.missing, makeInquiry());
    expect(res.status()).toBe(404);
  });

  // Data-driven negative path: each malformed body must be rejected with 400.
  for (const { name, mutate } of API_VALIDATION_CASES) {
    test(`POST rejects invalid body: ${name}`, { tag: ['@regression'] }, async ({ api }) => {
      const res = await api.postInquiryResponse(SAMPLE_PETS.available, mutate(makeInquiry()));
      expect(res.status()).toBe(400);
      expect(await res.json()).toMatchObject({ error: expect.any(String) });
    });
  }
});
