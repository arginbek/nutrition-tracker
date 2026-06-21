import { searchUsda } from '../lib/usda';

const mockFetch = (impl: Partial<Response> | (() => never)) => {
  (globalThis as any).fetch = jest.fn(async () => {
    if (typeof impl === 'function') impl();
    return impl as Response;
  });
};

describe('searchUsda', () => {
  afterEach(() => { jest.restoreAllMocks(); });

  it('returns ok with mapped foods on 200', async () => {
    mockFetch({ ok: true, status: 200, json: async () => ({ foods: [
      { fdcId: 1, description: 'Ribeye', foodNutrients: [{ nutrientNumber: '208', unitName: 'KCAL', value: 250 }] },
    ] }) } as any);
    const r = await searchUsda('ribeye', 'KEY');
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.foods).toHaveLength(1); expect(r.foods[0].name).toBe('Ribeye'); }
  });

  it('returns rate_limit on 429', async () => {
    mockFetch({ ok: false, status: 429 } as any);
    const r = await searchUsda('x', 'KEY');
    expect(r).toEqual({ ok: false, reason: 'rate_limit' });
  });

  it('returns unauthorized on 403', async () => {
    mockFetch({ ok: false, status: 403 } as any);
    const r = await searchUsda('x', 'KEY');
    expect(r).toEqual({ ok: false, reason: 'unauthorized' });
  });

  it('returns network on thrown fetch', async () => {
    (globalThis as any).fetch = jest.fn(async () => { throw new Error('offline'); });
    const r = await searchUsda('x', 'KEY');
    expect(r).toEqual({ ok: false, reason: 'network' });
  });
});
