import { offProductToFood, lookupBarcode, OffProduct } from '../lib/openfoodfacts';
import sample from '../assets/data/off-product-sample.json';

describe('offProductToFood', () => {
  it('maps OFF nutriments (per 100g) into a Food, sodium g->mg', () => {
    const f = offProductToFood(sample.code, sample.product as OffProduct);
    expect(f.id).toBe('off_3017620422003');
    expect(f.source).toBe('openfoodfacts');
    expect(f.barcode).toBe('3017620422003');
    expect(f.name).toBe('Nutella');
    expect(f.brand).toBe('Ferrero');
    expect(f.per100g.kcal).toBe(539);
    expect(f.per100g.protein).toBe(6.3);
    expect(f.per100g.sodium).toBe(43); // 0.0428 g * 1000 = 42.8 -> 43 mg
    expect(f.per100g.satFat).toBe(10.6);
    // serving "15 g" parsed + 100 g
    expect(f.servingOptions).toEqual([
      { label: '15 g', grams: 15 },
      { label: '100 g', grams: 100 },
    ]);
  });

  it('defaults missing nutriments to 0 and falls back serving to just 100 g', () => {
    const f = offProductToFood('123', { product_name: 'Bare', brands: null, serving_size: null, nutriments: {} } as OffProduct);
    expect(f.name).toBe('Bare');
    expect(f.brand).toBeNull();
    expect(f.per100g.kcal).toBe(0);
    expect(f.per100g.fiber).toBe(0);
    expect(f.servingOptions).toEqual([{ label: '100 g', grams: 100 }]);
  });
});

describe('lookupBarcode', () => {
  afterEach(() => { jest.restoreAllMocks(); });

  it('returns a Food when the product exists', async () => {
    (globalThis as any).fetch = jest.fn(async () => ({
      ok: true, status: 200, json: async () => sample,
    }));
    const f = await lookupBarcode('3017620422003');
    expect(f?.name).toBe('Nutella');
  });

  it('returns null when product is missing', async () => {
    (globalThis as any).fetch = jest.fn(async () => ({
      ok: true, status: 200, json: async () => ({ status: 0, status_verbose: 'product not found' }),
    }));
    expect(await lookupBarcode('000')).toBeNull();
  });

  it('returns null on network error', async () => {
    (globalThis as any).fetch = jest.fn(async () => { throw new Error('offline'); });
    expect(await lookupBarcode('x')).toBeNull();
  });
});
