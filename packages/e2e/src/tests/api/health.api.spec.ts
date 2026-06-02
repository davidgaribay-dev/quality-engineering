import { test, expect } from '../../support/fixtures.js';

test.describe('API · health', { tag: ['@api'] }, () => {
  test('GET /health returns ok', { tag: ['@smoke'] }, async ({ api }) => {
    const res = await api.health();
    await expect(res).toBeOK();
    expect(await res.json()).toEqual({ status: 'ok' });
  });
});
