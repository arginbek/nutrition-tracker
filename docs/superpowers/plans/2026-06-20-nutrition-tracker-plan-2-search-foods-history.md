# Nutrition Tracker — Plan 2: USDA Search, Custom Foods, Recipes, Copy-Day, History

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the tracker from a 46-food offline demo into a real tool: live USDA food search, user-created custom foods, saved recipes/meals, copy-from-a-previous-day, and a working History tab with day browsing and date navigation.

**Architecture:** Builds directly on Plan 1 (Expo Router + SQLite + ported design system). New tables (`recipes`, `recipe_components`, `settings`) are added additively via `CREATE TABLE IF NOT EXISTS` in the existing `SCHEMA` (no versioned migration needed — `initDb` runs the schema every launch). USDA FoodData Central is called over HTTPS; every fetched food is upserted into the local `foods` table so it becomes instantly loggable, favoritable, and offline-available. Pure logic (USDA→Food mapping, recipe totals, copy-day, history aggregation) is TDD'd; screens are verified by type-check + iOS bundle, with the human confirming on-device.

**Tech Stack:** Existing Plan-1 stack + `fetch` (built in) for USDA. No new native dependencies (so no new prebuild needed — only a rebuild).

## Global Constraints

- All Plan-1 Global Constraints still apply verbatim (design tokens, four fixed meals, per-100g internal nutrition, kcal+sodium integer / others 1-decimal rounding, snapshot rule, Feather icons, Inter, no shadows, opacity-only feedback, TypeScript strict).
- **USDA FoodData Central:** base URL `https://api.nal.usda.gov/fdc/v1`. Search endpoint `GET /foods/search?query=<q>&pageSize=25&api_key=<key>`. Key resolution: the value stored in `settings` under key `usda_api_key`, else the literal `DEMO_KEY`.
- **USDA nutrient numbers** (`nutrientNumber` strings) → our `Nutrients`: Energy kcal = `"208"` (the entry whose `unitName` is `KCAL`), protein `"203"`, total fat `"204"`, carbs `"205"`, fiber `"291"`, sugars `"269"`, sodium `"307"` (mg), saturated fat `"606"`. Missing nutrient → 0.
- **USDA values in the search response are per 100 g** for all dataTypes; map them straight into `per100g`.
- **Cached USDA food id:** `usda_<fdcId>`, `source: "usda"`. **Custom food id:** `custom_<timestamp>`, `source: "custom"`. **Recipe id:** `recipe_<timestamp>`.
- **Network is best-effort:** any USDA failure (no network, rate limit, bad key) must NOT crash search — fall back to local results and surface a quiet inline notice.
- **Logging a recipe** writes a single `LogEntry` (foodId = null, nameSnapshot = recipe name, servingLabel = "1 serving", quantity = 1, computed = recipe totals) — one tap, one row on Today, snapshot preserved.

---

## File Structure

```
db/
  schema.ts        # MODIFY: add settings, recipes, recipe_components tables
  queries.ts       # MODIFY: add getSetting/setSetting, recipe CRUD, copyDay, getLoggedDates
lib/
  types.ts         # MODIFY: add Recipe, RecipeComponent, RecipeInput
  usda.ts          # CREATE: usdaFoodToFood mapper (TDD) + searchUsda (network)
  recipe.ts        # CREATE: computeRecipeTotals (pure, TDD)
components/nutrition/
  CustomFoodForm.tsx   # CREATE
  RecipeBuilder.tsx    # CREATE
  DayHeader.tsx        # CREATE (date nav for Today)
app/(tabs)/
  add.tsx          # MODIFY: merge local + USDA search
  foods.tsx        # MODIFY: list custom foods + recipes; create buttons
  history.tsx      # MODIFY: real history list + copy-day
  index.tsx        # MODIFY: DayHeader + "copy previous day"
  settings.tsx     # MODIFY: USDA API key field
app/
  food/new.tsx     # CREATE: custom food modal
  recipe/new.tsx   # CREATE: recipe builder modal
  _layout.tsx      # MODIFY: register food/new + recipe/new modal routes
__tests__/
  usda.test.ts     # CREATE
  recipe.test.ts   # CREATE
  copyday.test.ts  # CREATE (pure clone helper)
assets/data/
  usda-search-sample.json  # CREATE: real FDC response fixture for the mapper test
```

---

## Task 1: DB schema + settings/recipe/history queries

**Files:**
- Modify: `db/schema.ts`
- Modify: `db/queries.ts`
- Modify: `lib/types.ts`

**Interfaces:**
- Produces (all async unless noted):
  - `getSetting(key: string): Promise<string | null>`, `setSetting(key: string, value: string): Promise<void>`
  - `createRecipe(name: string, components: RecipeComponentInput[]): Promise<string>` (returns recipe id)
  - `getRecipes(): Promise<Recipe[]>`, `getRecipeComponents(recipeId: string): Promise<RecipeComponent[]>`, `deleteRecipe(id: string): Promise<void>`
  - `getCustomFoods(): Promise<Food[]>`
  - `copyDay(fromDate: string, toDate: string): Promise<number>` (returns count copied)
  - `getLoggedDates(): Promise<{ date: string; kcal: number }[]>`
- Types added to `lib/types.ts`: `Recipe`, `RecipeComponent`, `RecipeComponentInput`.

- [ ] **Step 1: Add tables to the schema**

In `db/schema.ts`, append these statements to the `SCHEMA` template string (after the `targets` table, before the closing backtick):
```sql

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS recipe_components (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL,
  food_id TEXT NOT NULL,
  serving_label TEXT NOT NULL,
  quantity REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rc_recipe ON recipe_components(recipe_id);
```

- [ ] **Step 2: Add recipe types to `lib/types.ts`**

Append:
```ts
export interface Recipe {
  id: string;
  name: string;
}

export interface RecipeComponent {
  id: string;
  recipeId: string;
  foodId: string;
  servingLabel: string;
  quantity: number;
}

/** A component as supplied when creating a recipe (id is generated on insert). */
export interface RecipeComponentInput {
  foodId: string;
  servingLabel: string;
  quantity: number;
}
```

- [ ] **Step 3: Add settings + custom-foods + recipe + copy + history queries to `db/queries.ts`**

Append (uses `getDb`, existing `toFood`/`toEntry` mappers, and types — add the new type imports to the existing import line):
```ts
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
  const id = `recipe_${Date.now()}`;
  await getDb().runAsync('INSERT INTO recipes (id, name) VALUES (?, ?)', [id, name]);
  for (let i = 0; i < components.length; i++) {
    const c = components[i];
    await getDb().runAsync(
      `INSERT INTO recipe_components (id, recipe_id, food_id, serving_label, quantity)
       VALUES (?, ?, ?, ?, ?)`,
      [`rc_${Date.now()}_${i}`, id, c.foodId, c.servingLabel, c.quantity],
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
    await insertLogEntry({ ...e, id: `log_${Date.now()}_${i}`, date: toDate });
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
```
Update the existing import in `db/queries.ts` to include the new types: add `Recipe, RecipeComponent, RecipeComponentInput` to the `from '../lib/types'` import.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit` → clean. `npm test` → still green (22 tests).

- [ ] **Step 5: Commit**

```bash
git add db/schema.ts db/queries.ts lib/types.ts
git commit -m "feat: add settings, recipes, copy-day, and history queries"
```

---

## Task 2: USDA client + mapper (TDD)

**Files:**
- Create: `assets/data/usda-search-sample.json`
- Create: `lib/usda.ts`
- Test: `__tests__/usda.test.ts`

**Interfaces:**
- Consumes: `Food`, `Nutrients`, `ServingOption`, `EMPTY_NUTRIENTS` from `lib/types`.
- Produces:
  - `usdaFoodToFood(raw: UsdaFood): Food` — pure mapper (TDD).
  - `searchUsda(query: string, apiKey: string): Promise<Food[]>` — network; maps each result; returns [] on any error (never throws).
  - exported `UsdaFood` type (minimal shape used by the mapper).

- [ ] **Step 1: Create the fixture**

Create `assets/data/usda-search-sample.json` with two representative FDC results (one generic, one branded with a gram serving). Exact content:
```json
{
  "foods": [
    {
      "fdcId": 173944,
      "description": "Nuts, pistachio nuts, raw",
      "dataType": "SR Legacy",
      "brandName": null,
      "gtinUpc": null,
      "servingSize": null,
      "servingSizeUnit": null,
      "householdServingFullText": null,
      "foodNutrients": [
        { "nutrientNumber": "208", "unitName": "KCAL", "value": 560 },
        { "nutrientNumber": "203", "unitName": "G", "value": 20.2 },
        { "nutrientNumber": "204", "unitName": "G", "value": 45.3 },
        { "nutrientNumber": "205", "unitName": "G", "value": 27.2 },
        { "nutrientNumber": "291", "unitName": "G", "value": 10.6 },
        { "nutrientNumber": "269", "unitName": "G", "value": 7.7 },
        { "nutrientNumber": "307", "unitName": "MG", "value": 1 },
        { "nutrientNumber": "606", "unitName": "G", "value": 5.6 }
      ]
    },
    {
      "fdcId": 2341752,
      "description": "GREEK YOGURT, PLAIN",
      "dataType": "Branded",
      "brandName": "CHOBANI",
      "gtinUpc": "894700010045",
      "servingSize": 170,
      "servingSizeUnit": "g",
      "householdServingFullText": "1 container",
      "foodNutrients": [
        { "nutrientNumber": "208", "unitName": "KCAL", "value": 59 },
        { "nutrientNumber": "203", "unitName": "G", "value": 10 },
        { "nutrientNumber": "204", "unitName": "G", "value": 0 },
        { "nutrientNumber": "205", "unitName": "G", "value": 3.5 },
        { "nutrientNumber": "307", "unitName": "MG", "value": 36 }
      ]
    }
  ]
}
```

- [ ] **Step 2: Write the failing tests**

Create `__tests__/usda.test.ts`:
```ts
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
```

- [ ] **Step 3: Run to confirm failure**

Run: `npm test -- usda`
Expected: FAIL ("Cannot find module '../lib/usda'").

- [ ] **Step 4: Implement `lib/usda.ts`**

Create `lib/usda.ts`:
```ts
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

export async function searchUsda(query: string, apiKey: string): Promise<Food[]> {
  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=25&api_key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = (await res.json()) as { foods?: UsdaFood[] };
    return (data.foods ?? []).map(usdaFoodToFood);
  } catch {
    return [];
  }
}
```

- [ ] **Step 5: Run tests**

Run: `npm test -- usda`
Expected: PASS (both mapper cases).

- [ ] **Step 6: Commit**

```bash
git add lib/usda.ts assets/data/usda-search-sample.json __tests__/usda.test.ts
git commit -m "feat: add USDA FoodData Central client and mapper (TDD)"
```

---

## Task 3: Recipe totals (TDD)

**Files:**
- Create: `lib/recipe.ts`
- Test: `__tests__/recipe.test.ts`

**Interfaces:**
- Consumes: `Food`, `RecipeComponent`, `Nutrients`, `computeEntryNutrition`, `sumNutrients`.
- Produces: `recipeTotals(components: RecipeComponent[], foodById: (id: string) => Food | undefined): Nutrients` — pure; resolves each component's food, computes its nutrition (serving grams × qty), sums them. Components whose food is missing are skipped.

- [ ] **Step 1: Write the failing test**

Create `__tests__/recipe.test.ts`:
```ts
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
```

- [ ] **Step 2: Run to confirm failure**

Run: `npm test -- recipe`
Expected: FAIL.

- [ ] **Step 3: Implement `lib/recipe.ts`**

Create `lib/recipe.ts`:
```ts
import { Food, RecipeComponent, Nutrients } from './types';
import { computeEntryNutrition } from './nutrition';
import { sumNutrients } from './totals';

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
    // reuse sumNutrients by wrapping as a fake LogEntry-shaped accumulator input
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
```
(Note: `sumNutrients` operates on `LogEntry[]`; recipe components produce bare `Nutrients`, so this sums directly with the same rounding contract. The `sumNutrients` import is intentionally omitted — remove it if your linter flags it; do not add a fake LogEntry wrapper.)

Correction for Step 3: do NOT import `sumNutrients` (it is unused). The implementation above sums `Nutrients` directly. Final import line: `import { Food, RecipeComponent, Nutrients } from './types';` and `import { computeEntryNutrition } from './nutrition';`.

- [ ] **Step 4: Run tests**

Run: `npm test -- recipe`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/recipe.ts __tests__/recipe.test.ts
git commit -m "feat: add recipe totals computation (TDD)"
```

---

## Task 4: Settings — USDA API key field

**Files:**
- Modify: `app/(tabs)/settings.tsx`

**Interfaces:**
- Consumes: `getSetting`, `setSetting`.
- Produces: a "Food data" card in Settings with a USDA API key Field, loaded from `getSetting('usda_api_key')` on mount and saved via `setSetting('usda_api_key', value)`; shows the active key state (placeholder notes DEMO_KEY is used when blank).

- [ ] **Step 1: Add the USDA key card to Settings**

In `app/(tabs)/settings.tsx`, add imports `import { useEffect } from 'react';` (merge with existing react import) and `getSetting, setSetting` (merge into the existing `db/queries` import). Add state + load:
```tsx
const [usdaKey, setUsdaKey] = useState('');
const [keySaved, setKeySaved] = useState(false);
useEffect(() => { getSetting('usda_api_key').then(v => setUsdaKey(v ?? '')); }, []);
const saveKey = async () => {
  await setSetting('usda_api_key', usdaKey.trim());
  setKeySaved(true);
  setTimeout(() => setKeySaved(false), 1500);
};
```
Then render a second Card below the targets Card (inside the same ScrollView):
```tsx
<Card style={{ gap: spacing.md }}>
  <SectionLabel>Food data (USDA)</SectionLabel>
  <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.caption }}>
    Leave blank to use the shared DEMO_KEY (rate-limited). Get a free key at api.data.gov/signup.
  </Text>
  <Field
    value={usdaKey}
    onChangeText={setUsdaKey}
    placeholder="USDA API key (optional)"
    autoCapitalize="none"
    autoCorrect={false}
  />
  <Button variant="secondary" onPress={saveKey}>{keySaved ? 'Saved ✓' : 'Save key'}</Button>
</Card>
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit` clean; `npm test` green.

- [ ] **Step 3: Commit**

```bash
git add "app/(tabs)/settings.tsx"
git commit -m "feat: add USDA API key field in settings"
```

---

## Task 5: Add-tab USDA live search integration

**Files:**
- Modify: `app/(tabs)/add.tsx`

**Interfaces:**
- Consumes: `searchFoods` (local), `searchUsda`, `upsertFood`, `getSetting`, existing recents/frequents/favorites queries, `FoodSearchRow`.
- Produces: search that shows local matches instantly and merges debounced USDA results (deduped by id), caching each USDA food into `foods` so it is loggable/recents-able; a quiet "Searching USDA…" / "offline or no results" state; no crash on network failure.

- [ ] **Step 1: Add USDA merge to the Add screen**

Replace the search portion of `app/(tabs)/add.tsx`. Keep the recents/frequents/favorites code unchanged; change the `results` state handling to merge local + USDA with a debounce. Add imports: `import { useRef } from 'react';` (merge with existing react import), `searchUsda` from `../../lib/usda`, `upsertFood, getSetting` (merge into `db/queries` import). Add state:
```tsx
const [searching, setSearching] = useState(false);
const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
```
Replace the existing `onSearch` with:
```tsx
const onSearch = (text: string) => {
  setQ(text);
  const q = text.trim();
  if (debounce.current) clearTimeout(debounce.current);
  if (q.length < 2) { setResults([]); setSearching(false); return; }

  // instant local results
  searchFoods(q).then(setResults);

  // debounced USDA merge
  setSearching(true);
  debounce.current = setTimeout(async () => {
    const key = (await getSetting('usda_api_key'))?.trim() || 'DEMO_KEY';
    const remote = await searchUsda(q, key);
    for (const f of remote) { await upsertFood(f); }       // cache for instant/offline reuse
    setResults(prev => {
      const seen = new Set(prev.map(p => p.id));
      return [...prev, ...remote.filter(r => !seen.has(r.id))];
    });
    setSearching(false);
  }, 600);
};
```
In the results section JSX, show the searching/empty notice:
```tsx
{q.trim().length >= 2 && (
  <View style={{ gap: spacing.sm }}>
    <SectionLabel>Results</SectionLabel>
    {searching && (
      <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.caption }}>
        Searching USDA…
      </Text>
    )}
    {results.length === 0 && !searching
      ? <Text style={{ color: colors.textMuted, fontFamily: type.family }}>No matches (check your connection or USDA key).</Text>
      : results.map(row)}
  </View>
)}
```
(Keep the non-searching favorites/recent/frequent branch exactly as-is — render it only when `q.trim().length < 2`.)

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit` clean; `npm test` green; `npx expo export --platform ios` bundles.

- [ ] **Step 3: Commit**

```bash
git add "app/(tabs)/add.tsx"
git commit -m "feat: merge USDA live search into Add tab with local caching"
```

---

## Task 6: Custom food creation

**Files:**
- Create: `components/nutrition/CustomFoodForm.tsx`
- Create: `app/food/new.tsx`
- Modify: `app/_layout.tsx` (register `food/new` modal route)
- Modify: `app/(tabs)/foods.tsx` (Custom Foods section + create button)

**Interfaces:**
- Produces:
  - `CustomFoodForm({ onSave })` — name, brand (optional), serving size grams, and per-serving kcal/protein/carbs/fat (+ optional fiber/sugar/sodium/satFat); converts per-serving → per-100g; calls `onSave(food: Food)`.
  - `app/food/new.tsx` — modal hosting the form; on save → `upsertFood` then `router.back()`.
  - Foods tab lists custom foods (tap → `/log/<id>`).

- [ ] **Step 1: Build the form**

Create `components/nutrition/CustomFoodForm.tsx`:
```tsx
import { useState } from 'react';
import { View, Text } from 'react-native';
import { Food, EMPTY_NUTRIENTS } from '../../lib/types';
import { round1 } from '../../lib/nutrition';
import { Field } from '../ui/Field';
import { Button } from '../ui/Button';
import { SectionLabel } from '../ui/SectionLabel';
import { colors, spacing, type } from '../../theme';

const num = (s: string) => Number(s) || 0;

export function CustomFoodForm({ onSave }: { onSave: (food: Food) => void }) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [grams, setGrams] = useState('100');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const valid = name.trim().length > 0 && num(grams) > 0;

  const save = () => {
    const g = num(grams);
    const factor = 100 / g; // per-serving -> per-100g
    const food: Food = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      brand: brand.trim() || null,
      source: 'custom',
      barcode: null,
      per100g: {
        ...EMPTY_NUTRIENTS,
        kcal: Math.round(num(kcal) * factor),
        protein: round1(num(protein) * factor),
        carbs: round1(num(carbs) * factor),
        fat: round1(num(fat) * factor),
      },
      servingOptions: [
        { label: '1 serving', grams: g },
        { label: '100 g', grams: 100 },
      ],
    };
    onSave(food);
  };

  const field = (label: string, value: string, set: (s: string) => void, numeric = true) => (
    <View style={{ gap: spacing.xs }}>
      <SectionLabel>{label}</SectionLabel>
      <Field value={value} onChangeText={set} keyboardType={numeric ? 'numeric' : 'default'} autoCorrect={false} />
    </View>
  );

  return (
    <View style={{ gap: spacing.md }}>
      {field('Name', name, setName, false)}
      {field('Brand (optional)', brand, setBrand, false)}
      <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.caption }}>
        Enter the values from the label for ONE serving.
      </Text>
      {field('Serving size (g)', grams, setGrams)}
      {field('Calories', kcal, setKcal)}
      {field('Protein (g)', protein, setProtein)}
      {field('Carbs (g)', carbs, setCarbs)}
      {field('Fat (g)', fat, setFat)}
      <Button onPress={save} disabled={!valid}>Save food</Button>
    </View>
  );
}
```

- [ ] **Step 2: Create the modal screen**

Create `app/food/new.tsx`:
```tsx
import { ScrollView, Text } from 'react-native';
import { router } from 'expo-router';
import { CustomFoodForm } from '../../components/nutrition/CustomFoodForm';
import { upsertFood } from '../../db/queries';
import { Food } from '../../lib/types';
import { colors, spacing, type } from '../../theme';

export default function NewFood() {
  const onSave = async (food: Food) => { await upsertFood(food); router.back(); };
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas }} contentContainerStyle={{ padding: spacing.gutter, gap: spacing.base, paddingBottom: 40 }}>
      <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.heading }}>New custom food</Text>
      <CustomFoodForm onSave={onSave} />
    </ScrollView>
  );
}
```

- [ ] **Step 3: Register the route**

In `app/_layout.tsx`, add inside the `<Stack>` (next to the existing `log/[foodId]` screen):
```tsx
<Stack.Screen name="food/new" options={{ presentation: 'modal' }} />
```

- [ ] **Step 4: Foods tab — custom foods section**

Replace `app/(tabs)/foods.tsx`:
```tsx
import { useCallback, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getCustomFoods, getRecipes } from '../../db/queries';
import { Food, Recipe } from '../../lib/types';
import { Button } from '../../components/ui/Button';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { ListRow } from '../../components/ui/ListRow';
import { IconTile } from '../../components/ui/IconTile';
import { colors, spacing, type } from '../../theme';

export default function Foods() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const load = useCallback(async () => {
    setFoods(await getCustomFoods());
    setRecipes(await getRecipes());
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas }} contentContainerStyle={{ padding: spacing.gutter, gap: spacing.base, paddingBottom: 120 }}>
      <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.screenTitle }}>Foods</Text>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}><Button variant="secondary" onPress={() => router.push('/food/new')}>+ Food</Button></View>
        <View style={{ flex: 1 }}><Button variant="secondary" onPress={() => router.push('/recipe/new')}>+ Recipe</Button></View>
      </View>

      <View style={{ gap: spacing.sm }}>
        <SectionLabel>Saved Recipes</SectionLabel>
        {recipes.length === 0
          ? <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.bodySm }}>No recipes yet.</Text>
          : recipes.map(r => (
              <ListRow key={r.id} title={r.name}
                icon={<IconTile color={colors.amber}><Feather name="book-open" size={18} color={colors.amber} /></IconTile>}
                onPress={() => router.push(`/recipe/${r.id}`)} />
            ))}
      </View>

      <View style={{ gap: spacing.sm }}>
        <SectionLabel>Custom Foods</SectionLabel>
        {foods.length === 0
          ? <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.bodySm }}>No custom foods yet.</Text>
          : foods.map(f => (
              <ListRow key={f.id} title={f.name} subtitle={f.brand ?? `${f.per100g.kcal} kcal / 100 g`}
                icon={<IconTile color={colors.amber}><Feather name="box" size={18} color={colors.amber} /></IconTile>}
                onPress={() => router.push(`/log/${f.id}`)} />
            ))}
      </View>
    </ScrollView>
  );
}
```
(The `recipe/[id]` route is created in Task 6's recipe work — Task 7. If executing strictly in order, the recipe rows' `onPress` target exists after Task 7; that is fine because tapping only navigates at runtime.)

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit` clean; `npm test` green; `npx expo export --platform ios` bundles.

- [ ] **Step 6: Commit**

```bash
git add components/nutrition/CustomFoodForm.tsx app/food/new.tsx app/_layout.tsx "app/(tabs)/foods.tsx"
git commit -m "feat: custom food creation + Foods tab listing"
```

---

## Task 7: Recipes (builder, view, log)

**Files:**
- Create: `components/nutrition/RecipeBuilder.tsx`
- Create: `app/recipe/new.tsx`
- Create: `app/recipe/[id].tsx`
- Modify: `app/_layout.tsx` (register `recipe/new` + `recipe/[id]` routes)

**Interfaces:**
- Consumes: `searchFoods`, `getFood`, `createRecipe`, `getRecipes`, `getRecipeComponents`, `deleteRecipe`, `recipeTotals`, `insertLogEntry`, `useApp`.
- Produces:
  - `recipe/new.tsx` — name + add-component (search a food, pick its first serving, set qty) list; save via `createRecipe`.
  - `recipe/[id].tsx` — shows recipe totals + components; "Log to {meal}" inserts one combined `LogEntry`; delete recipe.

- [ ] **Step 1: Recipe builder modal**

Create `app/recipe/new.tsx`:
```tsx
import { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Field } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { ListRow } from '../../components/ui/ListRow';
import { searchFoods, createRecipe } from '../../db/queries';
import { Food, RecipeComponentInput } from '../../lib/types';
import { colors, spacing, type } from '../../theme';

interface Picked { food: Food; servingLabel: string; quantity: number; }

export default function NewRecipe() {
  const [name, setName] = useState('');
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [picked, setPicked] = useState<Picked[]>([]);

  const onSearch = (t: string) => {
    setQ(t);
    if (t.trim().length >= 2) searchFoods(t.trim()).then(setResults); else setResults([]);
  };
  const add = (food: Food) => {
    const serving = food.servingOptions[0];
    setPicked(p => [...p, { food, servingLabel: serving.label, quantity: 1 }]);
    setQ(''); setResults([]);
  };
  const remove = (i: number) => setPicked(p => p.filter((_, idx) => idx !== i));

  const save = async () => {
    const components: RecipeComponentInput[] = picked.map(p => ({
      foodId: p.food.id, servingLabel: p.servingLabel, quantity: p.quantity,
    }));
    await createRecipe(name.trim(), components);
    router.back();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas }} contentContainerStyle={{ padding: spacing.gutter, gap: spacing.base, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.heading }}>New recipe</Text>
      <Field value={name} onChangeText={setName} placeholder="Recipe name (e.g. Overnight oats)" />

      <View style={{ gap: spacing.sm }}>
        <SectionLabel>Add ingredients</SectionLabel>
        <Field value={q} onChangeText={onSearch} placeholder="Search a food to add…" autoCorrect={false} />
        {results.map(f => (
          <ListRow key={f.id} title={f.name} subtitle={f.brand ?? `${f.per100g.kcal} kcal / 100 g`}
            onPress={() => add(f)}
            trailing={<Feather name="plus" size={18} color={colors.amber} />} />
        ))}
      </View>

      {picked.length > 0 && (
        <View style={{ gap: spacing.sm }}>
          <SectionLabel>Ingredients ({picked.length})</SectionLabel>
          {picked.map((p, i) => (
            <ListRow key={i} title={p.food.name} subtitle={`${p.quantity} × ${p.servingLabel}`}
              onPress={() => remove(i)}
              trailing={<Feather name="x" size={18} color={colors.textMuted} />} />
          ))}
        </View>
      )}

      <Button onPress={save} disabled={name.trim().length === 0 || picked.length === 0}>Save recipe</Button>
    </ScrollView>
  );
}
```

- [ ] **Step 2: Recipe view + log modal**

Create `app/recipe/[id].tsx`:
```tsx
import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getRecipes, getRecipeComponents, getFood, deleteRecipe, insertLogEntry } from '../../db/queries';
import { recipeTotals } from '../../lib/recipe';
import { Food, Recipe, RecipeComponent, MealId, MEALS, MEAL_LABELS, LogEntry } from '../../lib/types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { useApp } from '../../state/AppContext';
import { colors, radii, spacing, type } from '../../theme';

export default function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedDate } = useApp();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [components, setComponents] = useState<RecipeComponent[]>([]);
  const [foods, setFoods] = useState<Map<string, Food>>(new Map());
  const [meal, setMeal] = useState<MealId>('breakfast');

  useEffect(() => {
    (async () => {
      const r = (await getRecipes()).find(x => x.id === id) ?? null;
      setRecipe(r);
      const comps = await getRecipeComponents(id);
      setComponents(comps);
      const m = new Map<string, Food>();
      for (const c of comps) { const f = await getFood(c.foodId); if (f) m.set(f.id, f); }
      setFoods(m);
    })();
  }, [id]);

  if (!recipe) return null;
  const totals = recipeTotals(components, (fid) => foods.get(fid));

  const log = async () => {
    const entry: LogEntry = {
      id: `log_${Date.now()}`, date: selectedDate, meal,
      foodId: null, nameSnapshot: recipe.name,
      servingLabel: '1 serving', quantity: 1, computed: totals,
    };
    await insertLogEntry(entry);
    router.back();
  };
  const onDelete = () => {
    Alert.alert('Delete recipe?', recipe.name, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteRecipe(recipe.id); router.back(); } },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas }} contentContainerStyle={{ padding: spacing.gutter, gap: spacing.base, paddingBottom: 40 }}>
      <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.heading }}>{recipe.name}</Text>
      <Card>
        <Text style={{ color: colors.text, fontFamily: type.familySemibold, fontSize: type.body }}>
          {totals.kcal} kcal · {totals.protein}g P · {totals.carbs}g C · {totals.fat}g F
        </Text>
      </Card>

      <View style={{ gap: spacing.sm }}>
        <SectionLabel>Ingredients</SectionLabel>
        {components.map(c => {
          const f = foods.get(c.foodId);
          return (
            <Text key={c.id} style={{ color: colors.textBody ?? colors.textSecondary, fontFamily: type.family, fontSize: type.bodySm }}>
              • {f?.name ?? 'Unknown'} — {c.quantity} × {c.servingLabel}
            </Text>
          );
        })}
      </View>

      <View style={{ gap: spacing.sm }}>
        <SectionLabel>Meal</SectionLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {MEALS.map(m => (
            <Pressable key={m} onPress={() => setMeal(m)} style={{
              paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.control,
              borderWidth: 1, borderColor: meal === m ? colors.amber : colors.border, backgroundColor: colors.secondary,
            }}>
              <Text style={{ color: colors.text, fontFamily: type.familyMedium, fontSize: type.bodySm }}>{MEAL_LABELS[m]}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Button onPress={log}>Log to {MEAL_LABELS[meal]}</Button>
      <Button variant="destructive" onPress={onDelete}>Delete recipe</Button>
    </ScrollView>
  );
}
```
(Use `colors.textSecondary` for the ingredient lines — `colors.textBody` does not exist; the `?? colors.textSecondary` guard above resolves to `colors.textSecondary`. Simplify to just `colors.textSecondary`.)

- [ ] **Step 3: Register routes**

In `app/_layout.tsx`, add inside `<Stack>`:
```tsx
<Stack.Screen name="recipe/new" options={{ presentation: 'modal' }} />
<Stack.Screen name="recipe/[id]" options={{ presentation: 'modal' }} />
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit` clean; `npm test` green; `npx expo export --platform ios` bundles.

- [ ] **Step 5: Commit**

```bash
git add components/nutrition/RecipeBuilder.tsx app/recipe/new.tsx "app/recipe/[id].tsx" app/_layout.tsx
git commit -m "feat: recipe builder, view, and one-tap logging"
```
(If `components/nutrition/RecipeBuilder.tsx` ended up unused because the builder lives in `app/recipe/new.tsx`, do not create an empty file — drop it from the commit. The plan lists it for symmetry; the screen-hosted builder is sufficient.)

---

## Task 8: Today date navigation + copy previous day

**Files:**
- Create: `components/nutrition/DayHeader.tsx`
- Modify: `app/(tabs)/index.tsx`

**Interfaces:**
- Consumes: `useApp` (selectedDate, setSelectedDate), `shiftISO`, `todayISO`, `copyDay`.
- Produces:
  - `DayHeader({ date, onPrev, onNext, isToday })` — ‹ date › row; shows "Today" when isToday.
  - Today screen uses DayHeader to move between days and a "Copy from yesterday" button that copies the previous day's entries into the selected date when the day is empty.

- [ ] **Step 1: DayHeader**

Create `components/nutrition/DayHeader.tsx`:
```tsx
import { View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, type } from '../../theme';

export function DayHeader({
  label, onPrev, onNext,
}: { label: string; onPrev: () => void; onNext: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Pressable onPress={onPrev} hitSlop={12}><Feather name="chevron-left" size={24} color={colors.textMuted} /></Pressable>
      <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.screenTitle }}>{label}</Text>
      <Pressable onPress={onNext} hitSlop={12}><Feather name="chevron-right" size={24} color={colors.textMuted} /></Pressable>
    </View>
  );
}
```

- [ ] **Step 2: Wire DayHeader + copy into Today**

In `app/(tabs)/index.tsx`: replace the plain `<Text>Today</Text>` header with DayHeader, and add a copy action. Add imports: `setSelectedDate` from `useApp` (already in context), `shiftISO, todayISO` from `../../lib/date`, `copyDay` from `../../db/queries`, `DayHeader` from `../../components/nutrition/DayHeader`, plus `Button` (already imported? add if missing).
Compute a label:
```tsx
const { selectedDate, setSelectedDate, target } = useApp();
const label = selectedDate === todayISO() ? 'Today' : selectedDate;
```
Header JSX (replace the title Text):
```tsx
<DayHeader
  label={label}
  onPrev={() => setSelectedDate(shiftISO(selectedDate, -1))}
  onNext={() => setSelectedDate(shiftISO(selectedDate, 1))}
/>
```
Add a copy button shown only when the day is empty (place under the empty hint):
```tsx
{entries.length === 0 && (
  <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
    <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.bodySm, textAlign: 'center' }}>
      Nothing logged yet. Tap Add to log a food.
    </Text>
    <Button variant="secondary" onPress={async () => { await copyDay(shiftISO(selectedDate, -1), selectedDate); load(); }}>
      Copy from previous day
    </Button>
  </View>
)}
```
(Remove the old standalone empty hint so it is not duplicated.)

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit` clean; `npm test` green; `npx expo export --platform ios` bundles.

- [ ] **Step 4: Commit**

```bash
git add components/nutrition/DayHeader.tsx "app/(tabs)/index.tsx"
git commit -m "feat: Today date navigation and copy-from-previous-day"
```

---

## Task 9: History tab

**Files:**
- Modify: `app/(tabs)/history.tsx`

**Interfaces:**
- Consumes: `getLoggedDates`, `useApp` (setSelectedDate), `todayISO`, `router`.
- Produces: a list of logged days (most recent first) with total kcal; tapping a day sets it as the selected date and navigates to Today; an empty state when nothing is logged.

- [ ] **Step 1: Implement History**

Replace `app/(tabs)/history.tsx`:
```tsx
import { useCallback, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { getLoggedDates } from '../../db/queries';
import { useApp } from '../../state/AppContext';
import { todayISO } from '../../lib/date';
import { ListRow } from '../../components/ui/ListRow';
import { Pill } from '../../components/ui/Pill';
import { colors, spacing, type } from '../../theme';

export default function History() {
  const { setSelectedDate } = useApp();
  const [days, setDays] = useState<{ date: string; kcal: number }[]>([]);
  const load = useCallback(async () => { setDays(await getLoggedDates()); }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const open = (date: string) => { setSelectedDate(date); router.push('/(tabs)'); };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas }} contentContainerStyle={{ padding: spacing.gutter, gap: spacing.base, paddingBottom: 120 }}>
      <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.screenTitle }}>History</Text>
      {days.length === 0 ? (
        <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.bodySm }}>
          No days logged yet. Log a food on Today and it'll show up here.
        </Text>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {days.map(d => (
            <ListRow
              key={d.date}
              title={d.date === todayISO() ? 'Today' : d.date}
              onPress={() => open(d.date)}
              meta={<Pill tone={colors.amber}>{d.kcal} kcal</Pill>}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit` clean; `npm test` green; `npx expo export --platform ios` bundles.

- [ ] **Step 3: Commit**

```bash
git add "app/(tabs)/history.tsx"
git commit -m "feat: History tab with logged-day list and navigation"
```

---

## Task 10: Full test pass + rebuild to device

**Files:** none (verification + deploy)

- [ ] **Step 1: Suite + types**

Run: `npm test` (expect all suites green incl. usda, recipe) and `npx tsc --noEmit` (clean).

- [ ] **Step 2: Rebuild to the connected iPhone**

No new native deps were added, so the existing `ios/` project is valid — just rebuild Release and install:
```bash
cd ios && xcodebuild -workspace Nutrition.xcworkspace -scheme Nutrition -configuration Release \
  -destination 'id=00008101-0006695A3E04001E' -derivedDataPath build -allowProvisioningUpdates \
  DEVELOPMENT_TEAM=549PHBVV44 CODE_SIGN_STYLE=Automatic build \
  && xcrun devicectl device install app --device 00008101-0006695A3E04001E \
     "$(pwd)/build/Build/Products/Release-iphoneos/Nutrition.app"
```
Expected: BUILD SUCCEEDED + install exit 0.

- [ ] **Step 3: Manual on-device smoke (human)**

Confirm: USDA search finds pistachio/steak; a USDA food logs and then appears under Recent; create a custom food and log it; build a recipe and one-tap log it; History lists days and tapping one opens it; "copy from previous day" works on an empty day.

- [ ] **Step 4: Tag**

```bash
git tag v0.2 && echo tagged
```

---

## Self-Review (against spec + Plan 1)

- **USDA live search** → Tasks 2, 5. Cached into `foods` so recents/favorites/offline work. ✓
- **USDA key in Settings, DEMO_KEY fallback** → Tasks 3, 5. ✓
- **Custom foods** → Task 6 (form converts per-serving → per-100g; appears in search + Foods tab). ✓
- **Recipes / saved meals (one-tap log)** → Tasks 1, 3, 7. Single combined LogEntry, snapshot preserved. ✓
- **Copy from previous day** → Tasks 1, 8. ✓
- **History tab** → Tasks 1, 9 (logged days + totals + navigation). ✓
- **Date navigation on Today** → Task 8 (uses Plan 1's `shiftISO`/`setSelectedDate`). ✓
- **Additive schema** (settings/recipes/recipe_components) via `CREATE TABLE IF NOT EXISTS` — safe on existing installs. ✓
- **No new native deps** → rebuild only, no re-prebuild. ✓

**Placeholder scan:** none. **Type consistency:** `Recipe`, `RecipeComponent`, `RecipeComponentInput`, `UsdaFood`, `Food`, `LogEntry`, `Nutrients` consistent across tasks; `recipeTotals` signature matches its caller in `recipe/[id].tsx`; query names match call sites. **Known nits to fix during implementation:** drop the unused `sumNutrients` import in `lib/recipe.ts`; use `colors.textSecondary` (not `textBody`) in `recipe/[id].tsx`; don't create an empty `RecipeBuilder.tsx`.
