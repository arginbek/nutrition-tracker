import { sumNutrients, remainingKcal, macroPercentOfTarget } from '../lib/totals';
import { LogEntry, EMPTY_NUTRIENTS } from '../lib/types';

const entry = (kcal: number, protein: number): LogEntry => ({
  id: Math.random().toString(), date: '2026-06-20', meal: 'lunch',
  foodId: null, nameSnapshot: 'x', servingLabel: '100 g', quantity: 1,
  computed: { ...EMPTY_NUTRIENTS, kcal, protein },
});

describe('sumNutrients', () => {
  it('sums kcal and protein across entries', () => {
    const r = sumNutrients([entry(100, 5), entry(250, 10)]);
    expect(r.kcal).toBe(350);
    expect(r.protein).toBe(15);
  });
  it('returns zeros for no entries', () => {
    expect(sumNutrients([])).toEqual(EMPTY_NUTRIENTS);
  });
});

describe('remainingKcal', () => {
  it('subtracts consumed from target', () => expect(remainingKcal(1400, 2000)).toBe(600));
  it('can go negative', () => expect(remainingKcal(2200, 2000)).toBe(-200));
});

describe('macroPercentOfTarget', () => {
  it('is a rounded percent', () => expect(macroPercentOfTarget(75, 150)).toBe(50));
  it('is 0 when target is 0', () => expect(macroPercentOfTarget(10, 0)).toBe(0));
});
