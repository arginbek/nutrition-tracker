export interface LogRow { foodId: string; date: string; }

export function recentFoodIds(rows: LogRow[], limit: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of rows) {
    if (!seen.has(r.foodId)) {
      seen.add(r.foodId);
      out.push(r.foodId);
      if (out.length >= limit) break;
    }
  }
  return out;
}

export function frequentFoodIds(rows: LogRow[], limit: number): string[] {
  const count = new Map<string, number>();
  const firstIndex = new Map<string, number>();
  rows.forEach((r, i) => {
    count.set(r.foodId, (count.get(r.foodId) ?? 0) + 1);
    if (!firstIndex.has(r.foodId)) firstIndex.set(r.foodId, i);
  });
  return [...count.keys()]
    .sort((a, b) => {
      const c = (count.get(b)! - count.get(a)!);
      if (c !== 0) return c;
      return firstIndex.get(a)! - firstIndex.get(b)!; // earlier index = more recent
    })
    .slice(0, limit);
}
