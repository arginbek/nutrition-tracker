import { seriesFromValues, niceBounds, yToPixel } from '../lib/trends';

describe('seriesFromValues', () => {
  it('builds a contiguous window ending at endISO, null for gaps', () => {
    const s = seriesFromValues(
      [{ date: '2026-06-18', value: 80 }, { date: '2026-06-20', value: 81 }],
      3, '2026-06-20',
    );
    expect(s).toEqual([
      { date: '2026-06-18', value: 80 },
      { date: '2026-06-19', value: null },
      { date: '2026-06-20', value: 81 },
    ]);
  });
});

describe('niceBounds', () => {
  it('pads min/max by 10%', () => {
    expect(niceBounds([10, 20])).toEqual({ min: 9, max: 21 });
  });
  it('handles a single value (no zero-height range)', () => {
    const b = niceBounds([50]);
    expect(b.min).toBe(49);
    expect(b.max).toBe(51);
  });
  it('handles empty', () => {
    expect(niceBounds([])).toEqual({ min: 0, max: 1 });
  });
});

describe('yToPixel', () => {
  it('maps max to top (0) and min to bottom (height)', () => {
    expect(yToPixel(20, 0, 20, 100)).toBe(0);
    expect(yToPixel(0, 0, 20, 100)).toBe(100);
    expect(yToPixel(10, 0, 20, 100)).toBe(50);
  });
});
