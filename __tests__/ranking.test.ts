import { recentFoodIds, frequentFoodIds } from '../lib/ranking';

// rows are pre-sorted most-recent-first (as the DB returns them)
const rows = [
  { foodId: 'a', date: '2026-06-20' },
  { foodId: 'b', date: '2026-06-20' },
  { foodId: 'a', date: '2026-06-19' },
  { foodId: 'a', date: '2026-06-18' },
  { foodId: 'c', date: '2026-06-17' },
];

describe('recentFoodIds', () => {
  it('returns distinct ids in first-seen order', () => {
    expect(recentFoodIds(rows, 10)).toEqual(['a', 'b', 'c']);
  });
  it('respects the limit', () => {
    expect(recentFoodIds(rows, 2)).toEqual(['a', 'b']);
  });
});

describe('frequentFoodIds', () => {
  it('orders by count desc then recency', () => {
    // a:3, b:1, c:1 -> a first, then b (more recent than c)
    expect(frequentFoodIds(rows, 10)).toEqual(['a', 'b', 'c']);
  });
});
