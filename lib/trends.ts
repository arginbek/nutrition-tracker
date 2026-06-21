import { shiftISO } from './date';

export interface SeriesPoint { date: string; value: number | null; }

export function seriesFromValues(
  values: { date: string; value: number }[],
  days: number,
  endISO: string,
): SeriesPoint[] {
  const map = new Map(values.map(v => [v.date, v.value]));
  const out: SeriesPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = shiftISO(endISO, -i);
    out.push({ date, value: map.has(date) ? map.get(date)! : null });
  }
  return out;
}

export function niceBounds(values: number[]): { min: number; max: number } {
  const nums = values.filter(v => Number.isFinite(v));
  if (nums.length === 0) return { min: 0, max: 1 };
  let min = Math.min(...nums);
  let max = Math.max(...nums);
  if (min === max) return { min: min - 1, max: max + 1 };
  const pad = (max - min) * 0.1;
  return { min: min - pad, max: max + pad };
}

export function yToPixel(value: number, min: number, max: number, height: number): number {
  if (max === min) return height / 2;
  return height - ((value - min) / (max - min)) * height;
}
