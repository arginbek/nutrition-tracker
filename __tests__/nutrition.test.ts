import { scaleNutrients, computeEntryNutrition, round1 } from '../lib/nutrition';
import { Nutrients } from '../lib/types';

const banana100g: Nutrients = {
  kcal: 89, protein: 1.1, carbs: 22.8, fat: 0.3,
  fiber: 2.6, sugar: 12.2, sodium: 1, satFat: 0.1,
};

describe('round1', () => {
  it('rounds to one decimal', () => expect(round1(1.149)).toBe(1.1));
});

describe('scaleNutrients', () => {
  it('scales a 118g banana from per-100g', () => {
    const r = scaleNutrients(banana100g, 118);
    expect(r.kcal).toBe(105); // 89 * 1.18 = 105.02 -> 105 (kcal rounds to integer)
    expect(r.protein).toBe(1.3); // 1.1 * 1.18 = 1.298 -> 1.3
  });
  it('returns zeros for 0 grams', () => {
    expect(scaleNutrients(banana100g, 0).kcal).toBe(0);
  });
});

describe('computeEntryNutrition', () => {
  it('applies serving grams times quantity', () => {
    // 1 cup rice cooked = 158g, 1.5 servings
    const rice100g: Nutrients = {
      kcal: 130, protein: 2.7, carbs: 28, fat: 0.3,
      fiber: 0.4, sugar: 0.1, sodium: 1, satFat: 0.1,
    };
    const r = computeEntryNutrition(rice100g, 158, 1.5);
    // 158 * 1.5 = 237g -> 130 * 2.37 = 308.1 -> 308 kcal
    expect(r.kcal).toBe(308);
  });
});
