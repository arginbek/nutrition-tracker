# Personal Nutrition Tracker — Design Spec

**Date:** 2026-06-20
**Status:** Approved for planning
**Author:** argynbyek (with Claude Code)

---

## 1. Summary

A single-user, local-first nutrition tracker for iPhone, built with **Expo / React Native**, styled with the **Mindful Unlock** design system (dark, warm, amber-accented, flat hairline cards, Inter, Feather icons). The product's north star is **effortless logging**: recents/frequents/favorites, saved recipes, copy-from-a-previous-day, a barcode scanner, and AI photo estimation all serve that single goal.

Guiding rules (from the product spec):
1. Logging a repeat food takes ≤ 3 taps.
2. Single user, no accounts, no social.
3. Local-first; works offline.
4. Show, don't nag.
5. Estimates are fine — optimize for "good enough, logged in 5 seconds."

---

## 2. Scope

### In scope (this build)
- Food search (USDA FoodData Central) + on-device cache
- Four fixed meals: Breakfast / Lunch / Dinner / Snacks
- Portion picker: standard serving presets, ½× / 1× / 1.5× / 2× multipliers, gram override, visual portion hints
- Daily dashboard: calories consumed vs. target + remaining; protein/carbs/fat rings/bars; today's items grouped by meal, tap to edit
- Manual targets (calories + macro split)
- Recents, frequents, favorites
- Custom foods (enter nutrition off a label)
- Recipes / saved meals (log a multi-food meal in one tap)
- Copy from a previous day / "log again"
- **Barcode scanner** (Open Food Facts)
- **Photo-AI portion estimation** (Claude vision → editable rows)
- **Weight log + trends** (calorie & weight charts)

### Out of scope (deferred)
- HealthKit / Health Connect sync
- iCloud / cross-device sync
- Auto target calculation (Mifflin-St Jeor)
- Voice logging
- Auto target onboarding wizard

### Out of scope (permanently — anti-clutter)
Social/feeds/leaderboards; in-app coaching/articles; gamified streak pressure; meal *planning* & grocery lists; restaurant menu directories; full 30+ micronutrient tracking (we keep only fiber, sugar, sodium, saturated fat beyond the big three); multiple themes / custom meal names / configurable-everything; food letter-grades (A–D).

---

## 3. Architecture & stack

| Concern | Choice | Notes |
|---|---|---|
| App | Expo (managed) + React Native + TypeScript | Real iOS app; runs in Expo Go for fast iteration |
| Routing | Expo Router (file-based, tabs) | 5 tabs (§7) |
| Local storage | `expo-sqlite` | Relational fits the data model; thin query helpers, no heavy ORM |
| State | SQLite as source of truth + light React context | Context only for selected date & targets; no Redux |
| Camera / barcode | `expo-camera` | Barcode + photo capture; works in Expo Go |
| Blur chrome | `expo-blur` (`BlurView`) | Frosted TabBar & sheets (DS "hybrid native" look) |
| Charts | `react-native-gifted-charts` | Weight & calorie trends |
| Icons | `@expo/vector-icons` (Feather) | Direct match to DS icon system |
| Fonts | `@expo-google-fonts/inter` | DS typeface (400/500/600/700) |
| Food data (text) | USDA FoodData Central API | `DEMO_KEY` in dev; user key in Settings |
| Food data (barcode) | Open Food Facts API | Free, no key |
| Photo AI | `@anthropic-ai/sdk`, model `claude-opus-4-8` | Vision + structured output; user key in Settings |

No backend server. All APIs are called directly from the app; results are cached locally.

---

## 4. Design system port

The DS ships as **web React + CSS tokens**, which do not run on RN. We port it:

- `theme/tokens.ts` — colors, spacing, radii, typography lifted verbatim from `tokens/*.css`. Drop ritual-only semantics (escalation L1–4, oath-purple). **Purple is unused** (no nutrition meaning). Keep: near-black canvas `#0A0A0E`, warm off-white text `#F0EDE8`, amber accent `#F59E0B`, success green, danger red, 13%-opacity accent washes, 16px signature card radius, 1px hairline borders, no shadows (state via tinted borders), opacity-on-press feedback.
- `components/ui/` — RN ports of: `Card`, `Button` (primary/secondary/ghost/destructive), `ListRow`, `Pill`, `IconTile`, `MeterBar`, `StatTile`, `SectionLabel`, `Field`, `Checkbox`, `TabBar` (BlurView).
- Nutrition composites built from those: `MacroRing` (calorie ring + P/C/F), `PortionStepper` (presets + multipliers + grams), `FoodSearchRow`, `MealSection`, `EditableEstimateRow` (photo-AI results).

---

## 5. Data model (SQLite)

Mirrors the product spec §5. **Nutrition is snapshotted onto each log entry at log time** — editing or deleting a food never rewrites history.

```
foods
  id, name, brand, source (usda|openfoodfacts|custom),
  barcode (nullable),
  per_100g (json: kcal, protein, carbs, fat, fiber, sugar, sodium, satFat),
  serving_options (json: [{ label, grams }])

log_entries
  id, date (YYYY-MM-DD), meal (breakfast|lunch|dinner|snack),
  food_id (nullable — null for quick-add / inline snapshot),
  serving_label, quantity (e.g. 1.5),
  computed (json snapshot: kcal, protein, carbs, fat, fiber, sugar, sodium, satFat),
  name_snapshot (for quick-add / display stability)

recipes
  id, name
recipe_components
  recipe_id, food_id, serving_label, quantity

targets            -- single row
  daily_kcal, protein_g, carbs_g, fat_g

weight_entries
  id, date, weight, unit (kg|lb)

favorites
  id, ref_type (food|recipe), ref_id
```

- **Recents / frequents** are derived by query over `log_entries` (most recent distinct foods; most frequently logged) — not stored.
- **Quick Add** writes a `log_entries` row with `food_id = null`, a `name_snapshot`, and a `computed` blob (often just kcal).

---

## 6. Key flows

### 6.1 Logging a repeat food (≤ 3 taps)
Add tab → tap a recent/favorite → confirm (default 1× serving) → logged. (3 taps.) Changing portion is one extra tap on a multiplier button.

### 6.2 Portion picker
Standard serving presets pulled from `serving_options`; ½×/1×/1.5×/2× multipliers; gram override field; optional visual hints ("1 palm ≈ 3 oz protein"). All math is pure functions (TDD): `computeNutrition(per_100g, serving_grams, quantity)`.

### 6.3 Barcode scan
Add tab → Scan → `expo-camera` reads EAN/UPC → query Open Food Facts → map to a `foods` row (cache it) → portion picker → log. Bad/missing data is correctable (edit before logging). Crowd-sourced data quality is variable by design.

### 6.4 Photo-AI estimation
Add tab → Snap → capture photo → send base64 `image` block to `claude-opus-4-8` with a JSON schema (`output_config.format` / Zod) → receive `{ items: [{name, grams, kcal, protein, carbs, fat}] }` → render as **editable rows the user confirms/corrects** (never auto-logged) → pick meal → log. Default effort low for a fast, cheap call.

### 6.5 Copy previous day
History (or Today) → "Copy from…" → pick a past day or a single past meal → entries are re-inserted for the selected date with fresh snapshots.

### 6.6 Weight
Quick weight add (one number) on History; trends chart plots weight + daily calories over time.

---

## 7. Screens (5 tabs)

1. **Today** — date switcher; calorie ring (consumed/target/remaining) as the hero; macro bars (P/C/F, grams + %); today's items grouped by meal, tap to edit; "Copy from…" action.
2. **Add** — search (recents/frequents/favorites pinned on top) · **Scan barcode** · **Snap photo** · **Quick Add**. Any path → portion picker → pick meal → log.
3. **History** — calendar/list of past days; trends chart; weight quick-add; "Copy from…".
4. **Foods** — custom foods + saved recipes/meals (create/edit; one-tap log a recipe).
5. **Settings** — manual targets + macro split; units (g/oz, kg/lb); USDA API key; Anthropic API key.

---

## 8. External APIs

- `lib/usda.ts` — search + detail; maps USDA portions → `serving_options`, USDA nutrients → `per_100g`. `DEMO_KEY` until a real key is entered in Settings (stored locally).
- `lib/openfoodfacts.ts` — barcode lookup → `foods` mapping; no key.
- `lib/photoAI.ts` — `@anthropic-ai/sdk`, `claude-opus-4-8`, base64 image + structured-output schema; key from Settings.

Every fetched food is cached into `foods` for instant, offline repeat use.

---

## 9. Testing

TDD for the pure logic that matters:
- Portion math (serving × multiplier × grams → kcal/macros)
- Daily totals aggregation & remaining calc
- Target / macro-% math
- USDA → model mapper; Open Food Facts → model mapper
- Photo-AI response → editable-rows mapping (schema validation)

`@testing-library/react-native` for a few key component behaviors (PortionStepper, MacroRing). UI-heavy screens verified by running the app (Expo Go).

---

## 10. Build sequence

Core-first, then layer accelerators (each step runnable):

1. Scaffold Expo + theme/tokens + ported UI primitives (verify against DS).
2. SQLite schema + query helpers + portion/totals logic (TDD).
3. Today dashboard (read path) with seeded sample data.
4. Add flow: search → portion picker → log (write path); recents/frequents/favorites.
5. USDA client + caching.
6. Custom foods + recipes + copy-previous-day.
7. History tab.
8. Weight log + trends chart.
9. Barcode scanner (Open Food Facts).
10. Photo-AI estimation (Claude vision → editable rows).

---

## 11. Known limitations & tradeoffs

- **On-device API keys.** USDA and Anthropic keys live on the device. Acceptable for a single-user personal app (your keys, your device). If the app is ever shared/published, move the Anthropic call behind a tiny proxy so the key isn't shipped.
- **No multi-device sync.** v0.1 is single-device local (Expo managed has no first-class iCloud-backed DB). Migration path noted; revisit if cross-device becomes a must-have.
- **Photo-AI accuracy is approximate.** Always shown as editable rows; never auto-logged. Costs ~cents per photo.
- **Barcode data is crowd-sourced.** Open Food Facts quality varies; all values correctable.
- **Estimates everywhere.** Database values and portion guesses carry error — the UI informs, it does not police (no grading, no guilt streaks).
