import { recipeTotals } from '../lib/recipe';
import { Food, RecipeComponent, EMPTY_NUTRIENTS } from '../lib/types';

const food = (id: string, kcalPer100: number): Food => ({
  id, name: id, brand: null, source: 'custom', barcode: null,
  per100g: { ...EMPTY_NUTRIENTS, kcal: kcalPer100, protein: 10 },
  servingOptions: [{ label: '100 g', grams: 100 }, { label: '1 cup', grams: 200 }],
});
const comp = (foodId: string, servingLabel: string, quantity: number): RecipeComponent => ({
  id: 'c_' + foodId, recipeId: 'r1', foodId, servingLabel, quantity,
});

describe('recipeTotals', () => {
  const foods = new Map<string, Food>([['a', food('a', 100)], ['b', food('b', 50)]]);
  const lookup = (id: string) => foods.get(id);

  it('sums component nutrition using serving grams x quantity', () => {
    // a: "1 cup"=200g x1 -> 200kcal ; b: "100 g"=100g x2 -> 100kcal
    const t = recipeTotals([comp('a', '1 cup', 1), comp('b', '100 g', 2)], lookup);
    expect(t.kcal).toBe(300);
    expect(t.protein).toBe(40); // a:20 + b:20
  });

  it('skips components whose food is missing', () => {
    const t = recipeTotals([comp('a', '100 g', 1), comp('missing', '100 g', 1)], lookup);
    expect(t.kcal).toBe(100);
  });
});
