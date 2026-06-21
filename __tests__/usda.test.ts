import { usdaFoodToFood, UsdaFood } from '../lib/usda';
import sample from '../assets/data/usda-search-sample.json';

const [pistachio, yogurt] = sample.foods as UsdaFood[];

describe('usdaFoodToFood', () => {
  it('maps a generic SR Legacy food (per-100g nutrients)', () => {
    const f = usdaFoodToFood(pistachio);
    expect(f.id).toBe('usda_173944');
    expect(f.source).toBe('usda');
    expect(f.name).toBe('Nuts, pistachio nuts, raw');
    expect(f.brand).toBeNull();
    expect(f.per100g.kcal).toBe(560);
    expect(f.per100g.protein).toBe(20.2);
    expect(f.per100g.sodium).toBe(1);
    expect(f.per100g.satFat).toBe(5.6);
    // no branded serving -> only the 100 g option
    expect(f.servingOptions).toEqual([{ label: '100 g', grams: 100 }]);
  });

  it('maps a branded food with brand, barcode, and a gram serving', () => {
    const f = usdaFoodToFood(yogurt);
    expect(f.id).toBe('usda_2341752');
    expect(f.brand).toBe('CHOBANI');
    expect(f.barcode).toBe('894700010045');
    expect(f.per100g.kcal).toBe(59);
    expect(f.per100g.fiber).toBe(0); // missing nutrient -> 0
    // branded serving (170 g) added before the 100 g option
    expect(f.servingOptions).toEqual([
      { label: '1 container', grams: 170 },
      { label: '100 g', grams: 100 },
    ]);
  });
});
