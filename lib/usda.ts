import { Food, Nutrients, ServingOption, EMPTY_NUTRIENTS } from './types';

export interface UsdaNutrient {
  nutrientNumber: string;
  unitName: string;
  value: number;
}
export interface UsdaFood {
  fdcId: number;
  description: string;
  dataType?: string;
  brandName?: string | null;
  brandOwner?: string | null;
  gtinUpc?: string | null;
  servingSize?: number | null;
  servingSizeUnit?: string | null;
  householdServingFullText?: string | null;
  foodNutrients: UsdaNutrient[];
}

const NUM = {
  kcal: '208', protein: '203', fat: '204', carbs: '205',
  fiber: '291', sugar: '269', sodium: '307', satFat: '606',
} as const;

function nutrientValue(food: UsdaFood, number: string, requireKcal = false): number {
  const match = food.foodNutrients.find(
    n => n.nutrientNumber === number && (!requireKcal || n.unitName?.toUpperCase() === 'KCAL'),
  );
  return match ? match.value : 0;
}

function toPer100g(food: UsdaFood): Nutrients {
  return {
    ...EMPTY_NUTRIENTS,
    kcal: Math.round(nutrientValue(food, NUM.kcal, true)),
    protein: nutrientValue(food, NUM.protein),
    carbs: nutrientValue(food, NUM.carbs),
    fat: nutrientValue(food, NUM.fat),
    fiber: nutrientValue(food, NUM.fiber),
    sugar: nutrientValue(food, NUM.sugar),
    sodium: Math.round(nutrientValue(food, NUM.sodium)),
    satFat: nutrientValue(food, NUM.satFat),
  };
}

function servingOptions(food: UsdaFood): ServingOption[] {
  const opts: ServingOption[] = [];
  const unit = (food.servingSizeUnit ?? '').toLowerCase();
  if (food.servingSize && (unit === 'g' || unit === 'ml')) {
    const label = food.householdServingFullText?.trim() || `${food.servingSize} g`;
    opts.push({ label, grams: food.servingSize });
  }
  opts.push({ label: '100 g', grams: 100 });
  return opts;
}

export function usdaFoodToFood(raw: UsdaFood): Food {
  return {
    id: `usda_${raw.fdcId}`,
    name: raw.description,
    brand: raw.brandName ?? raw.brandOwner ?? null,
    source: 'usda',
    barcode: raw.gtinUpc ?? null,
    per100g: toPer100g(raw),
    servingOptions: servingOptions(raw),
  };
}

export type UsdaSearchResult =
  | { ok: true; foods: Food[] }
  | { ok: false; reason: 'rate_limit' | 'unauthorized' | 'network' };

export async function searchUsda(query: string, apiKey: string): Promise<UsdaSearchResult> {
  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=25&api_key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url);
    if (res.status === 429) return { ok: false, reason: 'rate_limit' };
    if (res.status === 401 || res.status === 403) return { ok: false, reason: 'unauthorized' };
    if (!res.ok) return { ok: false, reason: 'network' };
    const data = (await res.json()) as { foods?: UsdaFood[] };
    return { ok: true, foods: (data.foods ?? []).map(usdaFoodToFood) };
  } catch {
    return { ok: false, reason: 'network' };
  }
}
