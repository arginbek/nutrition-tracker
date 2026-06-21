import { getDb } from './index';
import { Food, LogEntry, MealId, Nutrients, ServingOption, Target, Recipe, RecipeComponent, RecipeComponentInput } from '../lib/types';
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

// ---- Settings (key-value) ----
export async function getSetting(key: string): Promise<string | null> {
  const r = await getDb().getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?', [key],
  );
  return r ? r.value : null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await getDb().runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value],
  );
}

// ---- Custom foods ----
export async function getCustomFoods(): Promise<Food[]> {
  const rows = await getDb().getAllAsync<FoodRow>(
    `SELECT * FROM foods WHERE source = 'custom' ORDER BY name`,
  );
  return rows.map(toFood);
}

// ---- Recipes ----
export async function createRecipe(name: string, components: RecipeComponentInput[]): Promise<string> {
  const id = `recipe_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  await getDb().runAsync('INSERT INTO recipes (id, name) VALUES (?, ?)', [id, name]);
  for (let i = 0; i < components.length; i++) {
    const c = components[i];
    await getDb().runAsync(
      `INSERT INTO recipe_components (id, recipe_id, food_id, serving_label, quantity)
       VALUES (?, ?, ?, ?, ?)`,
      [`rc_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 7)}`, id, c.foodId, c.servingLabel, c.quantity],
    );
  }
  return id;
}

export async function getRecipes(): Promise<Recipe[]> {
  return getDb().getAllAsync<Recipe>('SELECT id, name FROM recipes ORDER BY name');
}

export async function getRecipeComponents(recipeId: string): Promise<RecipeComponent[]> {
  const rows = await getDb().getAllAsync<{
    id: string; recipe_id: string; food_id: string; serving_label: string; quantity: number;
  }>('SELECT * FROM recipe_components WHERE recipe_id = ?', [recipeId]);
  return rows.map(r => ({
    id: r.id, recipeId: r.recipe_id, foodId: r.food_id,
    servingLabel: r.serving_label, quantity: r.quantity,
  }));
}

export async function deleteRecipe(id: string): Promise<void> {
  await getDb().runAsync('DELETE FROM recipe_components WHERE recipe_id = ?', [id]);
  await getDb().runAsync('DELETE FROM recipes WHERE id = ?', [id]);
}

// ---- Copy a day's entries to another date ----
export async function copyDay(fromDate: string, toDate: string): Promise<number> {
  const entries = await getEntriesForDate(fromDate);
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    await insertLogEntry({ ...e, id: `log_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 7)}`, date: toDate });
  }
  return entries.length;
}

// ---- History: distinct logged days with total kcal ----
export async function getLoggedDates(): Promise<{ date: string; kcal: number }[]> {
  return getDb().getAllAsync<{ date: string; kcal: number }>(
    `SELECT date, CAST(SUM(json_extract(computed, '$.kcal')) AS INTEGER) AS kcal
     FROM log_entries GROUP BY date ORDER BY date DESC`,
  );
}
