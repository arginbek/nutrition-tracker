import { Food, RecipeComponent, Nutrients } from './types';
import { computeEntryNutrition } from './nutrition';

export function recipeTotals(
  components: RecipeComponent[],
  foodById: (id: string) => Food | undefined,
): Nutrients {
  const perComponent = components.flatMap((c) => {
    const food = foodById(c.foodId);
    if (!food) return [];
    const serving = food.servingOptions.find(s => s.label === c.servingLabel)
      ?? food.servingOptions[0];
    const nutrients = computeEntryNutrition(food.per100g, serving.grams, c.quantity);
    return [nutrients];
  });
  return perComponent.reduce<Nutrients>((acc, n) => ({
    kcal: acc.kcal + n.kcal,
    protein: Math.round((acc.protein + n.protein) * 10) / 10,
    carbs: Math.round((acc.carbs + n.carbs) * 10) / 10,
    fat: Math.round((acc.fat + n.fat) * 10) / 10,
    fiber: Math.round((acc.fiber + n.fiber) * 10) / 10,
    sugar: Math.round((acc.sugar + n.sugar) * 10) / 10,
    sodium: acc.sodium + n.sodium,
    satFat: Math.round((acc.satFat + n.satFat) * 10) / 10,
  }), { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, satFat: 0 });
}
