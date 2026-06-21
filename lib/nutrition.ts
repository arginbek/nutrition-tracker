import { Nutrients } from './types';

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** kcal rounds to whole numbers; everything else to one decimal. */
export function scaleNutrients(per100g: Nutrients, grams: number): Nutrients {
  const f = grams / 100;
  return {
    kcal: Math.round(per100g.kcal * f),
    protein: round1(per100g.protein * f),
    carbs: round1(per100g.carbs * f),
    fat: round1(per100g.fat * f),
    fiber: round1(per100g.fiber * f),
    sugar: round1(per100g.sugar * f),
    sodium: Math.round(per100g.sodium * f),
    satFat: round1(per100g.satFat * f),
  };
}

export function computeEntryNutrition(
  per100g: Nutrients, servingGrams: number, quantity: number,
): Nutrients {
  return scaleNutrients(per100g, servingGrams * quantity);
}
