import { getDb } from './index';
import { Food, LogEntry, MealId, Nutrients, ServingOption, Target } from '../lib/types';
import { recentFoodIds, frequentFoodIds } from '../lib/ranking';

interface FoodRow {
  id: string; name: string; brand: string | null; source: string;
  barcode: string | null; per100g: string; serving_options: string;
}
function toFood(r: FoodRow): Food {
  return {
    id: r.id, name: r.name, brand: r.brand,
    source: r.source as Food['source'], barcode: r.barcode,
    per100g: JSON.parse(r.per100g) as Nutrients,
    servingOptions: JSON.parse(r.serving_options) as ServingOption[],
  };
}

export async function upsertFood(f: Food): Promise<void> {
  await getDb().runAsync(
    `INSERT OR REPLACE INTO foods (id, name, brand, source, barcode, per100g, serving_options)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [f.id, f.name, f.brand, f.source, f.barcode, JSON.stringify(f.per100g), JSON.stringify(f.servingOptions)],
  );
}

export async function getFood(id: string): Promise<Food | null> {
  const r = await getDb().getFirstAsync<FoodRow>('SELECT * FROM foods WHERE id = ?', [id]);
  return r ? toFood(r) : null;
}

export async function searchFoods(q: string, limit = 50): Promise<Food[]> {
  const rows = await getDb().getAllAsync<FoodRow>(
    `SELECT * FROM foods WHERE name LIKE ? OR brand LIKE ? ORDER BY name LIMIT ?`,
    [`%${q}%`, `%${q}%`, limit],
  );
  return rows.map(toFood);
}

interface LogRow {
  id: string; date: string; meal: string; food_id: string | null;
  name_snapshot: string; serving_label: string; quantity: number; computed: string;
}
function toEntry(r: LogRow): LogEntry {
  return {
    id: r.id, date: r.date, meal: r.meal as MealId, foodId: r.food_id,
    nameSnapshot: r.name_snapshot, servingLabel: r.serving_label,
    quantity: r.quantity, computed: JSON.parse(r.computed) as Nutrients,
  };
}

export async function insertLogEntry(e: LogEntry): Promise<void> {
  await getDb().runAsync(
    `INSERT INTO log_entries (id, date, meal, food_id, name_snapshot, serving_label, quantity, computed)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [e.id, e.date, e.meal, e.foodId, e.nameSnapshot, e.servingLabel, e.quantity, JSON.stringify(e.computed)],
  );
}

export async function deleteLogEntry(id: string): Promise<void> {
  await getDb().runAsync('DELETE FROM log_entries WHERE id = ?', [id]);
}

export async function getEntriesForDate(date: string): Promise<LogEntry[]> {
  const rows = await getDb().getAllAsync<LogRow>(
    'SELECT * FROM log_entries WHERE date = ? ORDER BY rowid ASC', [date],
  );
  return rows.map(toEntry);
}

async function foodsByIds(ids: string[]): Promise<Food[]> {
  const out: Food[] = [];
  for (const id of ids) {
    const f = await getFood(id);
    if (f) out.push(f);
  }
  return out;
}

export async function getRecentFoods(limit: number): Promise<Food[]> {
  const rows = await getDb().getAllAsync<{ food_id: string; date: string }>(
    `SELECT food_id, date FROM log_entries WHERE food_id IS NOT NULL ORDER BY rowid DESC LIMIT 500`,
  );
  const ids = recentFoodIds(rows.map(r => ({ foodId: r.food_id, date: r.date })), limit);
  return foodsByIds(ids);
}

export async function getFrequentFoods(limit: number): Promise<Food[]> {
  const rows = await getDb().getAllAsync<{ food_id: string; date: string }>(
    `SELECT food_id, date FROM log_entries WHERE food_id IS NOT NULL ORDER BY rowid DESC LIMIT 500`,
  );
  const ids = frequentFoodIds(rows.map(r => ({ foodId: r.food_id, date: r.date })), limit);
  return foodsByIds(ids);
}

export async function getTarget(): Promise<Target> {
  const r = await getDb().getFirstAsync<{
    daily_kcal: number; protein_g: number; carbs_g: number; fat_g: number;
  }>('SELECT * FROM targets WHERE id = 1');
  return {
    dailyKcal: r?.daily_kcal ?? 2000, proteinG: r?.protein_g ?? 150,
    carbsG: r?.carbs_g ?? 200, fatG: r?.fat_g ?? 67,
  };
}

export async function setTarget(t: Target): Promise<void> {
  await getDb().runAsync(
    'UPDATE targets SET daily_kcal = ?, protein_g = ?, carbs_g = ?, fat_g = ? WHERE id = 1',
    [t.dailyKcal, t.proteinG, t.carbsG, t.fatG],
  );
}

export async function getFavoriteFoodIds(): Promise<string[]> {
  const rows = await getDb().getAllAsync<{ ref_id: string }>(
    `SELECT ref_id FROM favorites WHERE ref_type = 'food'`,
  );
  return rows.map(r => r.ref_id);
}

export async function toggleFavorite(refType: 'food' | 'recipe', refId: string): Promise<void> {
  const existing = await getDb().getFirstAsync<{ id: string }>(
    'SELECT id FROM favorites WHERE ref_type = ? AND ref_id = ?', [refType, refId],
  );
  if (existing) {
    await getDb().runAsync('DELETE FROM favorites WHERE id = ?', [existing.id]);
  } else {
    await getDb().runAsync(
      'INSERT INTO favorites (id, ref_type, ref_id) VALUES (?, ?, ?)',
      [`fav_${Date.now()}_${refId}`, refType, refId],
    );
  }
}
