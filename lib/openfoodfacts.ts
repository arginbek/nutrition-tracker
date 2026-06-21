import { Food, Nutrients, ServingOption, EMPTY_NUTRIENTS } from './types';

export interface OffNutriments {
  'energy-kcal_100g'?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
  fiber_100g?: number;
  sugars_100g?: number;
  sodium_100g?: number;        // grams
  'saturated-fat_100g'?: number;
}
export interface OffProduct {
  product_name?: string | null;
  brands?: string | null;
  serving_size?: string | null;
  nutriments: OffNutriments;
}

function per100g(n: OffNutriments): Nutrients {
  return {
    ...EMPTY_NUTRIENTS,
    kcal: Math.round(n['energy-kcal_100g'] ?? 0),
    protein: n.proteins_100g ?? 0,
    carbs: n.carbohydrates_100g ?? 0,
    fat: n.fat_100g ?? 0,
    fiber: n.fiber_100g ?? 0,
    sugar: n.sugars_100g ?? 0,
    sodium: Math.round((n.sodium_100g ?? 0) * 1000), // g -> mg
    satFat: n['saturated-fat_100g'] ?? 0,
  };
}

function servingOptions(serving: string | null | undefined): ServingOption[] {
  const opts: ServingOption[] = [];
  if (serving) {
    const m = serving.match(/([\d.]+)\s*g/i);
    if (m) opts.push({ label: serving.trim(), grams: Number(m[1]) });
  }
  opts.push({ label: '100 g', grams: 100 });
  return opts;
}

export function offProductToFood(code: string, p: OffProduct): Food {
  return {
    id: `off_${code}`,
    name: p.product_name?.trim() || 'Unknown product',
    brand: p.brands?.trim() || null,
    source: 'openfoodfacts',
    barcode: code,
    per100g: per100g(p.nutriments ?? {}),
    servingOptions: servingOptions(p.serving_size),
  };
}

export async function lookupBarcode(barcode: string): Promise<Food | null> {
  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=code,product_name,brands,serving_size,nutriments`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as { product?: OffProduct };
    if (!data.product || !data.product.nutriments) return null;
    return offProductToFood(barcode, data.product);
  } catch {
    return null;
  }
}
