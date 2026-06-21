# Nutrition Tracker — Plan 3: Weight Log + Trends

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a minimal weight log (one number per day) and simple trend charts (weight over time + daily calories over time) to the History tab, with no new native dependencies.

**Architecture:** Builds on Plans 1–2. A new additive `weight_entries` table (`CREATE TABLE IF NOT EXISTS`). Pure trend math (contiguous date series, Y-axis bounds, pixel mapping) is TDD'd in `lib/trends.ts`. Charts are tiny custom components built on the already-installed `react-native-svg` — no charting library, so no new native module and no re-prebuild. The History tab gains a Weight card (latest + quick add + kg/lb toggle) and two charts above the existing logged-days list.

**Tech Stack:** Existing stack + `react-native-svg` (already installed). No new deps.

## Global Constraints

- All Plan-1/2 Global Constraints still apply (design tokens, four meals, per-100g math, rounding, snapshot rule, Feather icons, Inter, no shadows, opacity-only feedback, TypeScript strict).
- **No new native dependencies.** Charts use `react-native-svg` only.
- **Weight storage:** one entry per day — `weight_entries(id, date, weight, unit)` with `id = weight_<date>` and `INSERT OR REPLACE` so re-entering a day overwrites it.
- **Weight unit:** a single setting `weight_unit` ∈ `kg | lb`, default `kg`, toggled on the History Weight card; stored on each entry and used for display/charts.
- **Trends live on History**, never on Today (Today home stays uncluttered per spec §2.3).
- **Charts degrade gracefully:** fewer than 2 data points → show a "log more to see a trend" hint instead of a broken chart.

---

## File Structure

```
db/
  schema.ts        # MODIFY: add weight_entries table
  queries.ts       # MODIFY: addWeight, getWeights, getLatestWeight, deleteWeight
lib/
  types.ts         # MODIFY: add WeightEntry
  trends.ts        # CREATE: seriesFromValues, niceBounds, yToPixel (pure, TDD)
components/charts/
  LineChart.tsx    # CREATE: weight line chart (SVG)
  BarChart.tsx     # CREATE: calorie bars (SVG)
components/nutrition/
  WeightCard.tsx   # CREATE: latest weight + quick add + unit toggle
app/(tabs)/
  history.tsx      # MODIFY: Weight card + charts above the logged-days list
__tests__/
  trends.test.ts   # CREATE
```

---

## Task 1: weight_entries table + weight queries

**Files:**
- Modify: `db/schema.ts`, `db/queries.ts`, `lib/types.ts`

**Interfaces:**
- Produces:
  - Type `WeightEntry { id: string; date: string; weight: number; unit: 'kg' | 'lb' }`.
  - `addWeight(date: string, weight: number, unit: 'kg' | 'lb'): Promise<void>` (INSERT OR REPLACE, id `weight_<date>`).
  - `getWeights(): Promise<WeightEntry[]>` (ascending by date).
  - `getLatestWeight(): Promise<WeightEntry | null>`.
  - `deleteWeight(date: string): Promise<void>`.

- [ ] **Step 1: Add the table**

In `db/schema.ts`, append inside the `SCHEMA` string (before the closing backtick):
```sql

CREATE TABLE IF NOT EXISTS weight_entries (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  weight REAL NOT NULL,
  unit TEXT NOT NULL
);
```

- [ ] **Step 2: Add the type**

In `lib/types.ts`, append:
```ts
export interface WeightEntry {
  id: string;
  date: string;       // YYYY-MM-DD
  weight: number;
  unit: 'kg' | 'lb';
}
```

- [ ] **Step 3: Add weight queries**

In `db/queries.ts`, add `WeightEntry` to the `from '../lib/types'` import, then append:
```ts
export async function addWeight(date: string, weight: number, unit: 'kg' | 'lb'): Promise<void> {
  await getDb().runAsync(
    'INSERT OR REPLACE INTO weight_entries (id, date, weight, unit) VALUES (?, ?, ?, ?)',
    [`weight_${date}`, date, weight, unit],
  );
}

export async function getWeights(): Promise<WeightEntry[]> {
  const rows = await getDb().getAllAsync<{ id: string; date: string; weight: number; unit: string }>(
    'SELECT * FROM weight_entries ORDER BY date ASC',
  );
  return rows.map(r => ({ id: r.id, date: r.date, weight: r.weight, unit: r.unit as 'kg' | 'lb' }));
}

export async function getLatestWeight(): Promise<WeightEntry | null> {
  const r = await getDb().getFirstAsync<{ id: string; date: string; weight: number; unit: string }>(
    'SELECT * FROM weight_entries ORDER BY date DESC LIMIT 1',
  );
  return r ? { id: r.id, date: r.date, weight: r.weight, unit: r.unit as 'kg' | 'lb' } : null;
}

export async function deleteWeight(date: string): Promise<void> {
  await getDb().runAsync('DELETE FROM weight_entries WHERE date = ?', [date]);
}
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit` clean; `npm test` green (30 tests).

- [ ] **Step 5: Commit**

```bash
git add db/schema.ts db/queries.ts lib/types.ts
git commit -m "feat: add weight_entries table and weight queries"
```

---

## Task 2: Trend math (TDD)

**Files:**
- Create: `lib/trends.ts`
- Test: `__tests__/trends.test.ts`

**Interfaces:**
- Consumes: `shiftISO` from `lib/date`.
- Produces:
  - `SeriesPoint { date: string; value: number | null }`.
  - `seriesFromValues(values: {date,value}[], days: number, endISO: string): SeriesPoint[]` — contiguous `days`-long window ending at `endISO`, value or null per day.
  - `niceBounds(values: number[]): {min,max}` — padded bounds; handles empty and all-equal.
  - `yToPixel(value, min, max, height): number` — maps a value to a y-pixel (0 at top).

- [ ] **Step 1: Write the failing tests**

Create `__tests__/trends.test.ts`:
```ts
import { seriesFromValues, niceBounds, yToPixel } from '../lib/trends';

describe('seriesFromValues', () => {
  it('builds a contiguous window ending at endISO, null for gaps', () => {
    const s = seriesFromValues(
      [{ date: '2026-06-18', value: 80 }, { date: '2026-06-20', value: 81 }],
      3, '2026-06-20',
    );
    expect(s).toEqual([
      { date: '2026-06-18', value: 80 },
      { date: '2026-06-19', value: null },
      { date: '2026-06-20', value: 81 },
    ]);
  });
});

describe('niceBounds', () => {
  it('pads min/max by 10%', () => {
    expect(niceBounds([10, 20])).toEqual({ min: 9, max: 21 });
  });
  it('handles a single value (no zero-height range)', () => {
    const b = niceBounds([50]);
    expect(b.min).toBe(49);
    expect(b.max).toBe(51);
  });
  it('handles empty', () => {
    expect(niceBounds([])).toEqual({ min: 0, max: 1 });
  });
});

describe('yToPixel', () => {
  it('maps max to top (0) and min to bottom (height)', () => {
    expect(yToPixel(20, 0, 20, 100)).toBe(0);
    expect(yToPixel(0, 0, 20, 100)).toBe(100);
    expect(yToPixel(10, 0, 20, 100)).toBe(50);
  });
});
```

- [ ] **Step 2: Run to confirm failure**

Run: `npm test -- trends`
Expected: FAIL ("Cannot find module '../lib/trends'").

- [ ] **Step 3: Implement `lib/trends.ts`**

```ts
import { shiftISO } from './date';

export interface SeriesPoint { date: string; value: number | null; }

export function seriesFromValues(
  values: { date: string; value: number }[],
  days: number,
  endISO: string,
): SeriesPoint[] {
  const map = new Map(values.map(v => [v.date, v.value]));
  const out: SeriesPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = shiftISO(endISO, -i);
    out.push({ date, value: map.has(date) ? map.get(date)! : null });
  }
  return out;
}

export function niceBounds(values: number[]): { min: number; max: number } {
  const nums = values.filter(v => Number.isFinite(v));
  if (nums.length === 0) return { min: 0, max: 1 };
  let min = Math.min(...nums);
  let max = Math.max(...nums);
  if (min === max) return { min: min - 1, max: max + 1 };
  const pad = (max - min) * 0.1;
  return { min: min - pad, max: max + pad };
}

export function yToPixel(value: number, min: number, max: number, height: number): number {
  if (max === min) return height / 2;
  return height - ((value - min) / (max - min)) * height;
}
```

- [ ] **Step 4: Run tests**

Run: `npm test -- trends`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/trends.ts __tests__/trends.test.ts
git commit -m "feat: add trend series + scaling math (TDD)"
```

---

## Task 3: Chart components (SVG)

**Files:**
- Create: `components/charts/LineChart.tsx`, `components/charts/BarChart.tsx`

**Interfaces:**
- Consumes: `react-native-svg`, `niceBounds`, `yToPixel`, `SeriesPoint`, theme.
- Produces:
  - `LineChart({ data: SeriesPoint[], color?, height? })` — polyline through non-null points + dots; "log more to see a trend" when <2 non-null points.
  - `BarChart({ data: SeriesPoint[], color?, height? })` — a bar per day (null/0 → empty slot); "log more to see a trend" when no positive values.

- [ ] **Step 1: LineChart**

Create `components/charts/LineChart.tsx`:
```tsx
import { View, Text } from 'react-native';
import Svg, { Polyline, Circle } from 'react-native-svg';
import { SeriesPoint, niceBounds, yToPixel } from '../../lib/trends';
import { colors, macroColors, spacing, type } from '../../theme';

export function LineChart({
  data, color = macroColors.calories, height = 120,
}: { data: SeriesPoint[]; color?: string; height?: number }) {
  const width = 300;
  const present = data.map((d, i) => ({ i, value: d.value })).filter(p => p.value != null) as { i: number; value: number }[];

  if (present.length < 2) {
    return (
      <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.caption }}>
          Log a few more days to see a trend.
        </Text>
      </View>
    );
  }

  const { min, max } = niceBounds(present.map(p => p.value));
  const n = data.length;
  const x = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * width);
  const points = present.map(p => `${x(p.i)},${yToPixel(p.value, min, max, height)}`).join(' ');

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <Polyline points={points} fill="none" stroke={color} strokeWidth={2} />
        {present.map(p => (
          <Circle key={p.i} cx={x(p.i)} cy={yToPixel(p.value, min, max, height)} r={3} fill={color} />
        ))}
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs }}>
        <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.captionSm }}>{min.toFixed(0)}</Text>
        <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.captionSm }}>{max.toFixed(0)}</Text>
      </View>
    </View>
  );
}
```

- [ ] **Step 2: BarChart**

Create `components/charts/BarChart.tsx`:
```tsx
import { View, Text } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { SeriesPoint, niceBounds, yToPixel } from '../../lib/trends';
import { colors, macroColors, type } from '../../theme';

export function BarChart({
  data, color = macroColors.calories, height = 120,
}: { data: SeriesPoint[]; color?: string; height?: number }) {
  const width = 300;
  const positives = data.map(d => d.value ?? 0);
  const hasData = positives.some(v => v > 0);

  if (!hasData) {
    return (
      <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.captionSm }}>
          No calories logged in this range yet.
        </Text>
      </View>
    );
  }

  const max = Math.max(...positives);
  const n = data.length;
  const gap = 2;
  const barW = (width - gap * (n - 1)) / n;

  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {data.map((d, i) => {
        const v = d.value ?? 0;
        const h = max > 0 ? (v / max) * height : 0;
        return (
          <Rect
            key={i}
            x={i * (barW + gap)}
            y={height - h}
            width={barW}
            height={h}
            rx={2}
            fill={v > 0 ? color : colors.secondary}
          />
        );
      })}
    </Svg>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit` clean; `npm test` green; `npx expo export --platform ios` bundles.

- [ ] **Step 4: Commit**

```bash
git add components/charts/LineChart.tsx components/charts/BarChart.tsx
git commit -m "feat: add SVG line and bar chart components"
```

---

## Task 4: Weight card + History trends

**Files:**
- Create: `components/nutrition/WeightCard.tsx`
- Modify: `app/(tabs)/history.tsx`

**Interfaces:**
- Consumes: `addWeight`, `getLatestWeight`, `getWeights`, `getLoggedDates`, `getSetting`/`setSetting`, `seriesFromValues`, `LineChart`, `BarChart`, `todayISO`, theme.
- Produces:
  - `WeightCard({ onSaved })` — shows latest weight, a numeric Field + kg/lb toggle + Save (writes today's weight, persists `weight_unit`), calls `onSaved` after save.
  - History tab renders, in order: Weight card, a "Weight (30 days)" LineChart, a "Calories (14 days)" BarChart, then the existing logged-days list.

- [ ] **Step 1: WeightCard**

Create `components/nutrition/WeightCard.tsx`:
```tsx
import { useCallback, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { addWeight, getLatestWeight, getSetting, setSetting } from '../../db/queries';
import { todayISO } from '../../lib/date';
import { WeightEntry } from '../../lib/types';
import { Card } from '../ui/Card';
import { Field } from '../ui/Field';
import { Button } from '../ui/Button';
import { SectionLabel } from '../ui/SectionLabel';
import { colors, radii, spacing, type } from '../../theme';

export function WeightCard({ onSaved }: { onSaved: () => void }) {
  const [latest, setLatest] = useState<WeightEntry | null>(null);
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg');

  const load = useCallback(async () => {
    setLatest(await getLatestWeight());
    const u = await getSetting('weight_unit');
    if (u === 'kg' || u === 'lb') setUnit(u);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const save = async () => {
    const n = Number(value);
    if (!n || n <= 0) return;
    await setSetting('weight_unit', unit);
    await addWeight(todayISO(), n, unit);
    setValue('');
    await load();
    onSaved();
  };

  return (
    <Card style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionLabel>Weight</SectionLabel>
        {latest && (
          <Text style={{ color: colors.text, fontFamily: type.familySemibold, fontSize: type.body }}>
            {latest.weight} {latest.unit}
          </Text>
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Field value={value} onChangeText={setValue} placeholder={`Today's weight (${unit})`} keyboardType="numeric" />
        </View>
        {(['kg', 'lb'] as const).map(u => (
          <Pressable key={u} onPress={() => setUnit(u)} style={{
            paddingHorizontal: spacing.md, paddingVertical: spacing.s10, borderRadius: radii.control,
            borderWidth: 1, borderColor: unit === u ? colors.amber : colors.border, backgroundColor: colors.secondary,
          }}>
            <Text style={{ color: unit === u ? colors.amber : colors.textMuted, fontFamily: type.familyMedium, fontSize: type.bodySm }}>{u}</Text>
          </Pressable>
        ))}
      </View>
      <Button variant="secondary" onPress={save} disabled={!value || Number(value) <= 0}>Save weight</Button>
    </Card>
  );
}
```

- [ ] **Step 2: History tab with charts**

Replace `app/(tabs)/history.tsx`:
```tsx
import { useCallback, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { getLoggedDates, getWeights } from '../../db/queries';
import { useApp } from '../../state/AppContext';
import { todayISO } from '../../lib/date';
import { seriesFromValues } from '../../lib/trends';
import { ListRow } from '../../components/ui/ListRow';
import { Pill } from '../../components/ui/Pill';
import { Card } from '../../components/ui/Card';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { WeightCard } from '../../components/nutrition/WeightCard';
import { LineChart } from '../../components/charts/LineChart';
import { BarChart } from '../../components/charts/BarChart';
import { colors, macroColors, spacing, type } from '../../theme';

export default function History() {
  const { setSelectedDate } = useApp();
  const [days, setDays] = useState<{ date: string; kcal: number }[]>([]);
  const [weights, setWeights] = useState<{ date: string; value: number }[]>([]);

  const load = useCallback(async () => {
    setDays(await getLoggedDates());
    const w = await getWeights();
    setWeights(w.map(e => ({ date: e.date, value: e.weight })));
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const open = (date: string) => { setSelectedDate(date); router.push('/(tabs)'); };

  const today = todayISO();
  const weightSeries = seriesFromValues(weights, 30, today);
  const calorieSeries = seriesFromValues(days.map(d => ({ date: d.date, value: d.kcal })), 14, today);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas }} contentContainerStyle={{ padding: spacing.gutter, gap: spacing.base, paddingBottom: 120 }}>
      <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.screenTitle }}>History</Text>

      <WeightCard onSaved={load} />

      <Card style={{ gap: spacing.sm }}>
        <SectionLabel>Weight · last 30 days</SectionLabel>
        <LineChart data={weightSeries} color={macroColors.protein} />
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <SectionLabel>Calories · last 14 days</SectionLabel>
        <BarChart data={calorieSeries} color={macroColors.calories} />
      </Card>

      <View style={{ gap: spacing.sm }}>
        <SectionLabel>Logged days</SectionLabel>
        {days.length === 0 ? (
          <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.bodySm }}>
            No days logged yet.
          </Text>
        ) : days.map(d => (
          <ListRow key={d.date} title={d.date === today ? 'Today' : d.date}
            onPress={() => open(d.date)} meta={<Pill tone={colors.amber}>{d.kcal} kcal</Pill>} />
        ))}
      </View>
    </ScrollView>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit` clean; `npm test` green; `npx expo export --platform ios` bundles.

- [ ] **Step 4: Commit**

```bash
git add components/nutrition/WeightCard.tsx "app/(tabs)/history.tsx"
git commit -m "feat: weight card and trend charts on History"
```

---

## Task 5: Full test pass + rebuild to device

**Files:** none (verification + deploy)

- [ ] **Step 1: Suite + types**

Run: `npm test` (expect all green incl. trends) and `npx tsc --noEmit` (clean).

- [ ] **Step 2: Rebuild to the iPhone**

No new native deps — rebuild Release + install:
```bash
cd ios && xcodebuild -workspace Nutrition.xcworkspace -scheme Nutrition -configuration Release \
  -destination 'id=00008101-0006695A3E04001E' -derivedDataPath build -allowProvisioningUpdates \
  DEVELOPMENT_TEAM=549PHBVV44 CODE_SIGN_STYLE=Automatic build \
  && xcrun devicectl device install app --device 00008101-0006695A3E04001E \
     "$(pwd)/build/Build/Products/Release-iphoneos/Nutrition.app"
```
Expected: BUILD SUCCEEDED + install exit 0.

- [ ] **Step 3: Manual on-device smoke (human)**

Confirm: enter today's weight on History → latest updates; over a few days the weight line appears; the calorie bars reflect logged days; the logged-days list still works.

- [ ] **Step 4: Tag**

```bash
git tag v0.3 && echo tagged
```

---

## Self-Review (against spec + Plans 1–2)

- **Weight log (one number, minimal)** → Tasks 1, 4 (WeightCard, one entry/day, kg/lb). ✓
- **Trends chart (weight + calories over time)** → Tasks 2, 3, 4 (custom SVG, no new native dep). ✓
- **Lives on History, not Today** → Task 4. ✓
- **Graceful with little data** → Task 3 (<2 points hint). ✓
- **Additive schema** (weight_entries via IF NOT EXISTS). ✓
- **No new native deps** → react-native-svg only → rebuild, no re-prebuild. ✓

**Placeholder scan:** none. **Type consistency:** `WeightEntry`, `SeriesPoint`, query names, and chart props match across tasks; `seriesFromValues` signature matches its History caller. **Known nit:** the weight chart x-positions points by their index in the 30-day window (gaps leave horizontal space) — intended, keeps dates proportional.
