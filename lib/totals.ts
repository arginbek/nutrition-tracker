import { LogEntry, Nutrients, EMPTY_NUTRIENTS } from './types';
import { round1 } from './nutrition';

export function sumNutrients(entries: LogEntry[]): Nutrients {
  return entries.reduce<Nutrients>((acc, e) => ({
    kcal: acc.kcal + e.computed.kcal,
    protein: round1(acc.protein + e.computed.protein),
    carbs: round1(acc.carbs + e.computed.carbs),
    fat: round1(acc.fat + e.computed.fat),
    fiber: round1(acc.fiber + e.computed.fiber),
    sugar: round1(acc.sugar + e.computed.sugar),
    sodium: acc.sodium + e.computed.sodium,
    satFat: round1(acc.satFat + e.computed.satFat),
  }), { ...EMPTY_NUTRIENTS });
}

export function remainingKcal(consumed: number, target: number): number {
  return target - consumed;
}

export function macroPercentOfTarget(consumedGrams: number, targetGrams: number): number {
  if (targetGrams <= 0) return 0;
  return Math.round((consumedGrams / targetGrams) * 100);
}
