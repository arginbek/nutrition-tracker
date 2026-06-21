import { parseItems, scaleItem, analyzePhoto } from '../lib/photoAI';

describe('parseItems', () => {
  it('parses well-formed items and clamps negatives', () => {
    const json = JSON.stringify({ items: [
      { name: 'Rice', grams: 150, kcal: 195, protein: 4, carbs: 42, fat: 0.5 },
      { name: 'Bad', grams: 100, kcal: -5, protein: 3, carbs: 1, fat: 1 },
    ] });
    const items = parseItems(json);
    expect(items).toHaveLength(2);
    expect(items[0].name).toBe('Rice');
    expect(items[1].kcal).toBe(0); // negative clamped
  });
  it('returns [] on invalid JSON', () => {
    expect(parseItems('not json')).toEqual([]);
  });
  it('returns [] when items missing', () => {
    expect(parseItems(JSON.stringify({ foo: 1 }))).toEqual([]);
  });
});

describe('scaleItem', () => {
  it('rescales nutrition proportionally to new grams', () => {
    const base = { name: 'Rice', grams: 100, kcal: 130, protein: 2.7, carbs: 28, fat: 0.3 };
    const s = scaleItem(base, 150);
    expect(s.grams).toBe(150);
    expect(s.kcal).toBe(195);       // 130 * 1.5
    expect(s.protein).toBe(4.1);    // 2.7 * 1.5 = 4.05 -> 4.1
  });
  it('zeros out when grams <= 0', () => {
    const s = scaleItem({ name: 'X', grams: 100, kcal: 100, protein: 5, carbs: 5, fat: 5 }, 0);
    expect(s.kcal).toBe(0);
    expect(s.grams).toBe(0);
  });
});

describe('analyzePhoto', () => {
  afterEach(() => { jest.restoreAllMocks(); });

  it('returns items on a 200 with structured JSON text', async () => {
    (globalThis as any).fetch = jest.fn(async () => ({
      ok: true, status: 200,
      json: async () => ({ content: [{ type: 'text', text: JSON.stringify({ items: [
        { name: 'Egg', grams: 50, kcal: 72, protein: 6, carbs: 0.4, fat: 5 },
      ] }) }] }),
    }));
    const r = await analyzePhoto('BASE64', 'KEY');
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.items[0].name).toBe('Egg'); }
  });
  it('returns unauthorized on 401', async () => {
    (globalThis as any).fetch = jest.fn(async () => ({ ok: false, status: 401, json: async () => ({}) }));
    expect(await analyzePhoto('B', 'BAD')).toEqual({ ok: false, reason: 'unauthorized' });
  });
  it('returns refusal when stop_reason is refusal', async () => {
    (globalThis as any).fetch = jest.fn(async () => ({
      ok: true, status: 200, json: async () => ({ stop_reason: 'refusal', content: [] }),
    }));
    expect(await analyzePhoto('B', 'K')).toEqual({ ok: false, reason: 'refusal' });
  });
  it('returns network on thrown fetch', async () => {
    (globalThis as any).fetch = jest.fn(async () => { throw new Error('offline'); });
    expect(await analyzePhoto('B', 'K')).toEqual({ ok: false, reason: 'network' });
  });
});
