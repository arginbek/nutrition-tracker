# Nutrition Tracker — Plan 1: Foundation + Usable MVP

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a working, offline, dark-themed Expo nutrition tracker where you can log seeded foods into four meals with a portion picker and see a daily calorie + macro dashboard, with recents/frequents/favorites.

**Architecture:** Expo (managed) + React Native + TypeScript, Expo Router tabs. SQLite (`expo-sqlite`) is the source of truth; pure functions handle all nutrition math (fully TDD'd with Jest). The Mindful Unlock design system is ported to RN primitives. Nutrition is snapshotted onto each log entry at write time so history never silently changes.

**Tech Stack:** Expo SDK (latest), React Native, TypeScript, Expo Router, expo-sqlite, expo-blur, @expo/vector-icons (Feather), @expo-google-fonts/inter, Jest (jest-expo) + @testing-library/react-native.

## Global Constraints

- **Design tokens are verbatim from the design system** (`design-system/mindful-unlock-design-system/project/tokens/*.css`): canvas `#0A0A0E`, card `#13131A`, raised `#18181F`, secondary/input `#1C1C26`, border `#1E1E2A`, text `#F0EDE8`, text-secondary `#B8B4BE`, text-muted `#6B6875`, amber `#F59E0B`, success `#22C55E`, danger `#EF4444`. Accent washes are the color + `22` hex alpha (~13%). Signature card radius **16px**; buttons/inputs 12–14px; pills fully round. Cards = flat surface + **1px hairline border**, **no shadow**; signal state by tinting the border. Blur only on TabBar/sheets.
- **Typeface:** Inter only, weights 400/500/600/700. Screen titles 26/700; headings 18/600; body 14–16/400; captions 11–13; section eyebrows 13/600 uppercase, 0.8px letter-spacing.
- **Icons:** Feather only (`@expo/vector-icons` `Feather`). No emoji, no custom SVG icons.
- **Purple is unused** (it has no nutrition meaning).
- **Four fixed meals only:** `breakfast | lunch | dinner | snack`. No custom meal names.
- **No food letter-grades, no streak pressure, no social.**
- **All nutrition is per-100g internally**; grams is the canonical portion unit.
- **Snapshot rule:** every `log_entries` row stores a `computed` JSON blob captured at log time.
- **TypeScript strict mode on.** No `any` in committed code except typed JSON boundaries.

---

## File Structure

```
app/
  _layout.tsx                 # Root: fonts, DB init, providers
  (tabs)/
    _layout.tsx               # Tab navigator (TabBar)
    index.tsx                 # Today
    add.tsx                   # Add food
    foods.tsx                 # Foods (stub in Plan 1)
    history.tsx               # History (stub in Plan 1)
    settings.tsx              # Settings (manual targets)
theme/
  tokens.ts                   # Colors, spacing, radii, type — verbatim from DS
  index.ts                    # Re-exports
components/ui/
  Card.tsx  Button.tsx  Pill.tsx  IconTile.tsx  SectionLabel.tsx
  ListRow.tsx  MeterBar.tsx  StatTile.tsx  Field.tsx  TabBarIcon.tsx
components/nutrition/
  MacroRing.tsx  MacroBar.tsx  PortionStepper.tsx  FoodSearchRow.tsx
  MealSection.tsx
lib/
  nutrition.ts                # Pure portion + macro math (TDD)
  totals.ts                   # Daily aggregation (TDD)
  ranking.ts                  # recents/frequents from rows (TDD)
  types.ts                    # Shared domain types
db/
  schema.ts                   # CREATE TABLE statements + migration
  index.ts                    # openDatabase + init
  queries.ts                  # CRUD: foods, logEntries, favorites, targets
state/
  AppContext.tsx              # selectedDate + targets
assets/data/
  seed-foods.json             # ~100 common foods
__tests__/
  nutrition.test.ts  totals.test.ts  ranking.test.ts
```

---

## Task 1: Scaffold Expo app + tooling

**Files:**
- Create: `package.json`, `app.json`, `tsconfig.json`, `babel.config.js`, `jest.config.js`, `jest.setup.ts`, `.gitignore`
- Create: `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`

**Interfaces:**
- Produces: a runnable Expo Router app with 5 tab routes and a passing no-op test, so every later task can `npm test` and `npx expo start`.

- [ ] **Step 1: Create the Expo project**

Run:
```bash
cd /Users/argynbyek/Desktop/VibeCoding/Nutrition
npx create-expo-app@latest app-src --template blank-typescript
```
Then move its contents up if you prefer a flat root, OR keep the app under `app-src/` and run all later commands from there. **This plan assumes the project root is the Expo app root** (where `package.json` lives). Adjust paths if you nest it.

Expected: a `package.json`, `App.tsx`, `tsconfig.json` are created.

- [ ] **Step 2: Add Expo Router + dependencies**

Run:
```bash
npx expo install expo-router expo-sqlite expo-blur @expo/vector-icons @expo-google-fonts/inter expo-font
npm install --save-dev jest jest-expo @testing-library/react-native @types/jest
```

Expected: dependencies appear in `package.json`.

- [ ] **Step 3: Configure Expo Router entry + app.json**

Set `package.json` `"main"` to `"expo-router/entry"`. In `app.json`, under `expo`, add:
```json
{
  "scheme": "nutrition",
  "userInterfaceStyle": "dark",
  "plugins": ["expo-router", "expo-sqlite"]
}
```
Delete the default `App.tsx` (Expo Router uses `app/`).

- [ ] **Step 4: Configure Jest**

Create `jest.config.js`:
```js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg))',
  ],
};
```
Create `jest.setup.ts` with a single line: `import '@testing-library/react-native';`
Add to `package.json` scripts: `"test": "jest"`, `"test:watch": "jest --watch"`.

- [ ] **Step 5: Write a smoke test**

Create `__tests__/smoke.test.ts`:
```ts
describe('toolchain', () => {
  it('runs jest', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Run the smoke test**

Run: `npm test -- smoke`
Expected: PASS, 1 test.

- [ ] **Step 7: Create minimal tab layout so the app boots**

Create `app/_layout.tsx`:
```tsx
import { Stack } from 'expo-router';
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```
Create `app/(tabs)/_layout.tsx`:
```tsx
import { Tabs } from 'expo-router';
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="add" options={{ title: 'Add' }} />
      <Tabs.Screen name="history" options={{ title: 'History' }} />
      <Tabs.Screen name="foods" options={{ title: 'Foods' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
```
Create placeholder screens `app/(tabs)/index.tsx`, `add.tsx`, `history.tsx`, `foods.tsx`, `settings.tsx`, each:
```tsx
import { View, Text } from 'react-native';
export default function Screen() {
  return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>TODO</Text></View>;
}
```
(Use a distinct label per file.)

- [ ] **Step 8: Verify the app boots**

Run: `npx expo start` and open in Expo Go (or `w` for web).
Expected: 5 tabs render with "TODO" placeholders.

- [ ] **Step 9: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Expo Router app with Jest"
```

---

## Task 2: Design tokens

**Files:**
- Create: `theme/tokens.ts`, `theme/index.ts`
- Test: `__tests__/tokens.test.ts`

**Interfaces:**
- Produces: `colors`, `spacing`, `radii`, `type`, and `tint(hex)` — consumed by every UI component.

- [ ] **Step 1: Write the failing test**

Create `__tests__/tokens.test.ts`:
```ts
import { colors, spacing, radii, tint } from '../theme/tokens';

describe('tokens', () => {
  it('exposes the brand palette verbatim', () => {
    expect(colors.canvas).toBe('#0A0A0E');
    expect(colors.amber).toBe('#F59E0B');
    expect(colors.border).toBe('#1E1E2A');
  });
  it('signature card radius is 16', () => {
    expect(radii.card).toBe(16);
  });
  it('screen gutter is 20', () => {
    expect(spacing.gutter).toBe(20);
  });
  it('tint() appends 22 alpha (~13%)', () => {
    expect(tint('#F59E0B')).toBe('#F59E0B22');
  });
});
```

- [ ] **Step 2: Run it to confirm failure**

Run: `npm test -- tokens`
Expected: FAIL ("Cannot find module '../theme/tokens'").

- [ ] **Step 3: Implement tokens**

Create `theme/tokens.ts`:
```ts
export const colors = {
  canvas: '#0A0A0E',
  card: '#13131A',
  raised: '#18181F',
  muted: '#16161E',
  secondary: '#1C1C26',
  border: '#1E1E2A',
  text: '#F0EDE8',
  textSecondary: '#B8B4BE',
  textMuted: '#6B6875',
  amber: '#F59E0B',
  amberLight: '#FCD34D',
  success: '#22C55E',
  danger: '#EF4444',
  onAccent: '#0A0A0E',
} as const;

// macro accent colors (within brand palette)
export const macroColors = {
  calories: colors.amber,
  protein: colors.success,
  carbs: colors.amberLight,
  fat: '#A78BFA', // soft violet purely for the 3rd macro bar; not "commitment purple"
} as const;

export const spacing = {
  xs: 4, sm: 8, s10: 10, md: 12, s14: 14,
  base: 16, s18: 18, gutter: 20, lg: 24, xl: 28, xxl: 32,
} as const;

export const radii = {
  badge: 8, control: 12, row: 14, card: 16, tile: 20, pill: 999,
} as const;

export const type = {
  family: 'Inter_400Regular',
  familyMedium: 'Inter_500Medium',
  familySemibold: 'Inter_600SemiBold',
  familyBold: 'Inter_700Bold',
  screenTitle: 26,
  heading: 18,
  body: 16,
  bodySm: 14,
  caption: 13,
  captionSm: 11,
  eyebrow: 13,
} as const;

/** Append ~13% alpha (the design system's `color + "22"` idiom). */
export function tint(hex: string): string {
  return `${hex}22`;
}
```
Create `theme/index.ts`:
```ts
export * from './tokens';
```

- [ ] **Step 4: Run the test**

Run: `npm test -- tokens`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add theme __tests__/tokens.test.ts
git commit -m "feat: add Mindful Unlock design tokens"
```

---

## Task 3: Load Inter fonts at root

**Files:**
- Modify: `app/_layout.tsx`

**Interfaces:**
- Produces: Inter weights available app-wide; root renders nothing until fonts load.

- [ ] **Step 1: Implement font loading**

Replace `app/_layout.tsx`:
```tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold,
} from '@expo-google-fonts/inter';
import { colors } from '../theme';

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold,
  });
  if (!loaded) return null;
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.canvas },
        }}
      />
    </>
  );
}
```

- [ ] **Step 2: Verify by running**

Run: `npx expo start` → open app.
Expected: app boots on a near-black background, no font errors in the console.

- [ ] **Step 3: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat: load Inter fonts and set dark canvas"
```

---

## Task 4: Core UI primitives (Card, SectionLabel, Pill, IconTile)

**Files:**
- Create: `components/ui/Card.tsx`, `components/ui/SectionLabel.tsx`, `components/ui/Pill.tsx`, `components/ui/IconTile.tsx`

**Interfaces:**
- Produces:
  - `Card({ accent?, padding?, children, style })` — flat surface, 1px border (tinted to `accent` when given), radius 16.
  - `SectionLabel({ children })` — uppercase eyebrow.
  - `Pill({ tone?, dot?, children })` — rounded chip on a 13% wash.
  - `IconTile({ color?, size?, children })` — Feather glyph on a 13% wash.

- [ ] **Step 1: Implement Card**

Create `components/ui/Card.tsx`:
```tsx
import { View, ViewStyle, StyleProp } from 'react-native';
import { colors, radii, spacing } from '../../theme';

export function Card({
  accent, padding = spacing.base, children, style,
}: {
  accent?: string;
  padding?: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: accent ?? colors.border,
          borderRadius: radii.card,
          padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
```

- [ ] **Step 2: Implement SectionLabel**

Create `components/ui/SectionLabel.tsx`:
```tsx
import { Text } from 'react-native';
import { colors, type } from '../../theme';

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontFamily: type.familySemibold,
        fontSize: type.eyebrow,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        color: colors.textMuted,
      }}
    >
      {children}
    </Text>
  );
}
```

- [ ] **Step 3: Implement Pill**

Create `components/ui/Pill.tsx`:
```tsx
import { View, Text } from 'react-native';
import { colors, radii, type, tint } from '../../theme';

export function Pill({
  tone = colors.amber, dot = false, children,
}: {
  tone?: string;
  dot?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: tint(tone),
        borderRadius: radii.pill,
        paddingHorizontal: 10, paddingVertical: 4,
      }}
    >
      {dot && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: tone }} />}
      <Text style={{ color: tone, fontFamily: type.familyMedium, fontSize: type.captionSm }}>
        {children}
      </Text>
    </View>
  );
}
```

- [ ] **Step 4: Implement IconTile**

Create `components/ui/IconTile.tsx`:
```tsx
import { View } from 'react-native';
import { radii, tint } from '../../theme';

export function IconTile({
  color, size = 40, children,
}: {
  color: string;
  size?: number;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        width: size, height: size, borderRadius: radii.control,
        backgroundColor: tint(color),
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      {children}
    </View>
  );
}
```

- [ ] **Step 5: Verify by rendering on the Today placeholder**

Temporarily edit `app/(tabs)/index.tsx` to render a `Card` containing a `SectionLabel`, a `Pill`, and an `IconTile` with a Feather `coffee` icon. Run `npx expo start`.
Expected: a flat dark card with hairline border, an amber pill on a faint amber wash, and an amber icon tile. Revert the placeholder edit after confirming.

- [ ] **Step 6: Commit**

```bash
git add components/ui
git commit -m "feat: add Card, SectionLabel, Pill, IconTile primitives"
```

---

## Task 5: List + meter primitives (ListRow, MeterBar, Button, Field)

**Files:**
- Create: `components/ui/ListRow.tsx`, `components/ui/MeterBar.tsx`, `components/ui/Button.tsx`, `components/ui/Field.tsx`
- Test: `__tests__/meterbar.test.tsx`

**Interfaces:**
- Produces:
  - `ListRow({ icon?, title, subtitle?, meta?, trailing?, onPress? })`
  - `MeterBar({ value, max, color?, label?, count? })` — clamps fill 0–100%.
  - `Button({ variant?, icon?, disabled?, onPress, children })` — variants `primary|secondary|ghost|destructive`.
  - `Field({ value, onChangeText, placeholder?, keyboardType?, ... })`

- [ ] **Step 1: Write the failing test for MeterBar fill math**

Create `components/ui/meter.ts`:
```ts
export function fillPercent(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(1, value / max)) * 100;
}
```
Create `__tests__/meterbar.test.tsx`:
```ts
import { fillPercent } from '../components/ui/meter';

describe('fillPercent', () => {
  it('is 50 at half', () => expect(fillPercent(50, 100)).toBe(50));
  it('clamps over max to 100', () => expect(fillPercent(150, 100)).toBe(100));
  it('clamps negative to 0', () => expect(fillPercent(-5, 100)).toBe(0));
  it('is 0 when max is 0', () => expect(fillPercent(10, 0)).toBe(0));
});
```

- [ ] **Step 2: Run it**

Run: `npm test -- meterbar`
Expected: PASS (the helper already exists; this locks the contract).

- [ ] **Step 3: Implement MeterBar**

Create `components/ui/MeterBar.tsx`:
```tsx
import { View, Text } from 'react-native';
import { colors, radii, type } from '../../theme';
import { fillPercent } from './meter';

export function MeterBar({
  value, max, color = colors.amber, label, count,
}: {
  value: number; max: number; color?: string; label?: string; count?: string;
}) {
  const pct = fillPercent(value, max);
  return (
    <View>
      {(label != null || count != null) && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          {label != null && (
            <Text style={{ color: colors.text, fontFamily: type.familyMedium, fontSize: type.bodySm }}>{label}</Text>
          )}
          {count != null && (
            <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.bodySm }}>{count}</Text>
          )}
        </View>
      )}
      <View style={{ height: 6, borderRadius: radii.pill, backgroundColor: colors.secondary, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: radii.pill }} />
      </View>
    </View>
  );
}
```

- [ ] **Step 4: Implement ListRow**

Create `components/ui/ListRow.tsx`:
```tsx
import { Pressable, View, Text } from 'react-native';
import { colors, radii, spacing, type } from '../../theme';

export function ListRow({
  icon, title, subtitle, meta, trailing, onPress,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  meta?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.6 : 1,
        flexDirection: 'row', alignItems: 'center', gap: spacing.s10,
        backgroundColor: colors.card,
        borderWidth: 1, borderColor: colors.border, borderRadius: radii.row,
        padding: spacing.md,
      })}
    >
      {icon}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ color: colors.text, fontFamily: type.familyMedium, fontSize: type.bodySm }}>{title}</Text>
        {subtitle != null && (
          <Text numberOfLines={1} style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.caption, marginTop: 2 }}>{subtitle}</Text>
        )}
      </View>
      {meta}
      {trailing}
    </Pressable>
  );
}
```

- [ ] **Step 5: Implement Button**

Create `components/ui/Button.tsx`:
```tsx
import { Pressable, Text, View } from 'react-native';
import { colors, radii, spacing, type } from '../../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
const palette: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.amber, fg: colors.onAccent, border: 'transparent' },
  secondary: { bg: colors.secondary, fg: colors.text, border: colors.border },
  ghost: { bg: 'transparent', fg: colors.amber, border: 'transparent' },
  destructive: { bg: colors.danger, fg: '#fff', border: 'transparent' },
};

export function Button({
  variant = 'primary', icon, disabled = false, onPress, children,
}: {
  variant?: Variant;
  icon?: React.ReactNode;
  disabled?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
}) {
  const p = palette[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
        backgroundColor: p.bg, borderWidth: 1, borderColor: p.border,
        borderRadius: radii.row, paddingVertical: spacing.s14, paddingHorizontal: spacing.lg,
      })}
    >
      <Text style={{ color: p.fg, fontFamily: type.familyBold, fontSize: type.body }}>{children}</Text>
      {icon != null && <View>{icon}</View>}
    </Pressable>
  );
}
```

- [ ] **Step 6: Implement Field**

Create `components/ui/Field.tsx`:
```tsx
import { TextInput, TextInputProps } from 'react-native';
import { colors, radii, spacing, type } from '../../theme';

export function Field(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      {...props}
      style={[
        {
          backgroundColor: colors.secondary,
          borderWidth: 1, borderColor: colors.border, borderRadius: radii.row,
          paddingHorizontal: spacing.md, paddingVertical: spacing.md,
          color: colors.text, fontFamily: type.family, fontSize: type.body,
        },
        props.style,
      ]}
    />
  );
}
```

- [ ] **Step 7: Run the meter test again, then commit**

Run: `npm test -- meterbar` → PASS.
```bash
git add components/ui __tests__/meterbar.test.tsx
git commit -m "feat: add ListRow, MeterBar, Button, Field primitives"
```

---

## Task 6: Domain types + nutrition math (TDD)

**Files:**
- Create: `lib/types.ts`, `lib/nutrition.ts`
- Test: `__tests__/nutrition.test.ts`

**Interfaces:**
- Produces:
  - Types: `MealId`, `Nutrients`, `ServingOption`, `Food`, `LogEntry`, `Target`.
  - `scaleNutrients(per100g: Nutrients, grams: number): Nutrients`
  - `computeEntryNutrition(per100g, servingGrams, quantity): Nutrients`
  - `round1(n)` helper.

- [ ] **Step 1: Define shared types**

Create `lib/types.ts`:
```ts
export type MealId = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export const MEALS: MealId[] = ['breakfast', 'lunch', 'dinner', 'snack'];
export const MEAL_LABELS: Record<MealId, string> = {
  breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snacks',
};

export interface Nutrients {
  kcal: number; protein: number; carbs: number; fat: number;
  fiber: number; sugar: number; sodium: number; satFat: number;
}

export interface ServingOption { label: string; grams: number; }

export interface Food {
  id: string;
  name: string;
  brand: string | null;
  source: 'usda' | 'openfoodfacts' | 'custom';
  barcode: string | null;
  per100g: Nutrients;
  servingOptions: ServingOption[];
}

export interface LogEntry {
  id: string;
  date: string;            // YYYY-MM-DD
  meal: MealId;
  foodId: string | null;
  nameSnapshot: string;
  servingLabel: string;
  quantity: number;
  computed: Nutrients;     // snapshot at log time
}

export interface Target {
  dailyKcal: number; proteinG: number; carbsG: number; fatG: number;
}

export const EMPTY_NUTRIENTS: Nutrients = {
  kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, satFat: 0,
};
```

- [ ] **Step 2: Write the failing tests**

Create `__tests__/nutrition.test.ts`:
```ts
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
```

- [ ] **Step 3: Run to confirm failure**

Run: `npm test -- nutrition`
Expected: FAIL ("Cannot find module '../lib/nutrition'").

- [ ] **Step 4: Implement nutrition math**

Create `lib/nutrition.ts`:
```ts
import { Nutrients } from './types';

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** kcal rounds to whole numbers; everything else to one decimal. */
export function scaleNutrients(per100g: Nutrients, grams: number): Nutrients {
  const f = grams / 100;
  return {
    kcal: Math.round(per100g.kcal * f),
    protein: round1(per100g.protein * f),
    carbs: round1(per100g.carbs * f),
    fat: round1(per100g.fat * f),
    fiber: round1(per100g.fiber * f),
    sugar: round1(per100g.sugar * f),
    sodium: Math.round(per100g.sodium * f),
    satFat: round1(per100g.satFat * f),
  };
}

export function computeEntryNutrition(
  per100g: Nutrients, servingGrams: number, quantity: number,
): Nutrients {
  return scaleNutrients(per100g, servingGrams * quantity);
}
```

- [ ] **Step 5: Run tests**

Run: `npm test -- nutrition`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/types.ts lib/nutrition.ts __tests__/nutrition.test.ts
git commit -m "feat: add domain types and portion math (TDD)"
```

---

## Task 7: Daily totals aggregation (TDD)

**Files:**
- Create: `lib/totals.ts`
- Test: `__tests__/totals.test.ts`

**Interfaces:**
- Consumes: `LogEntry`, `Nutrients`, `Target` from `lib/types`.
- Produces:
  - `sumNutrients(entries: LogEntry[]): Nutrients`
  - `macroPercentOfTarget(consumedGrams, targetGrams): number` (0–100+, rounded int)
  - `remainingKcal(consumed, target): number`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/totals.test.ts`:
```ts
import { sumNutrients, remainingKcal, macroPercentOfTarget } from '../lib/totals';
import { LogEntry, EMPTY_NUTRIENTS } from '../lib/types';

const entry = (kcal: number, protein: number): LogEntry => ({
  id: Math.random().toString(), date: '2026-06-20', meal: 'lunch',
  foodId: null, nameSnapshot: 'x', servingLabel: '100 g', quantity: 1,
  computed: { ...EMPTY_NUTRIENTS, kcal, protein },
});

describe('sumNutrients', () => {
  it('sums kcal and protein across entries', () => {
    const r = sumNutrients([entry(100, 5), entry(250, 10)]);
    expect(r.kcal).toBe(350);
    expect(r.protein).toBe(15);
  });
  it('returns zeros for no entries', () => {
    expect(sumNutrients([])).toEqual(EMPTY_NUTRIENTS);
  });
});

describe('remainingKcal', () => {
  it('subtracts consumed from target', () => expect(remainingKcal(1400, 2000)).toBe(600));
  it('can go negative', () => expect(remainingKcal(2200, 2000)).toBe(-200));
});

describe('macroPercentOfTarget', () => {
  it('is a rounded percent', () => expect(macroPercentOfTarget(75, 150)).toBe(50));
  it('is 0 when target is 0', () => expect(macroPercentOfTarget(10, 0)).toBe(0));
});
```

- [ ] **Step 2: Run to confirm failure**

Run: `npm test -- totals`
Expected: FAIL.

- [ ] **Step 3: Implement totals**

Create `lib/totals.ts`:
```ts
import { LogEntry, Nutrients, EMPTY_NUTRIENTS } from './types';
import { round1 } from './nutrition';

export function sumNutrients(entries: LogEntry[]): Nutrients {
  return entries.reduce<Nutrients>((acc, e) => ({
    kcal: acc.kcal + e.computed.kcal,
    protein: round1(acc.protein + e.computed.protein),
    carbs: round1(acc.carbs + e.computed.carbs),
    fat: round1(acc.fat + e.computed.fat),
    fiber: round1(acc.fiber + e.computed.fiber),
    sugar: round1(acc.sugar + e.computed.sugar),
    sodium: acc.sodium + e.computed.sodium,
    satFat: round1(acc.satFat + e.computed.satFat),
  }), { ...EMPTY_NUTRIENTS });
}

export function remainingKcal(consumed: number, target: number): number {
  return target - consumed;
}

export function macroPercentOfTarget(consumedGrams: number, targetGrams: number): number {
  if (targetGrams <= 0) return 0;
  return Math.round((consumedGrams / targetGrams) * 100);
}
```

- [ ] **Step 4: Run tests**

Run: `npm test -- totals`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/totals.ts __tests__/totals.test.ts
git commit -m "feat: add daily totals aggregation (TDD)"
```

---

## Task 8: Recents/frequents ranking (TDD)

**Files:**
- Create: `lib/ranking.ts`
- Test: `__tests__/ranking.test.ts`

**Interfaces:**
- Consumes: rows of `{ foodId, date }` (most recent first by query).
- Produces:
  - `recentFoodIds(rows, limit): string[]` — distinct, preserving first-seen order.
  - `frequentFoodIds(rows, limit): string[]` — by descending count, then most recent.

- [ ] **Step 1: Write the failing tests**

Create `__tests__/ranking.test.ts`:
```ts
import { recentFoodIds, frequentFoodIds } from '../lib/ranking';

// rows are pre-sorted most-recent-first (as the DB returns them)
const rows = [
  { foodId: 'a', date: '2026-06-20' },
  { foodId: 'b', date: '2026-06-20' },
  { foodId: 'a', date: '2026-06-19' },
  { foodId: 'a', date: '2026-06-18' },
  { foodId: 'c', date: '2026-06-17' },
];

describe('recentFoodIds', () => {
  it('returns distinct ids in first-seen order', () => {
    expect(recentFoodIds(rows, 10)).toEqual(['a', 'b', 'c']);
  });
  it('respects the limit', () => {
    expect(recentFoodIds(rows, 2)).toEqual(['a', 'b']);
  });
});

describe('frequentFoodIds', () => {
  it('orders by count desc then recency', () => {
    // a:3, b:1, c:1 -> a first, then b (more recent than c)
    expect(frequentFoodIds(rows, 10)).toEqual(['a', 'b', 'c']);
  });
});
```

- [ ] **Step 2: Run to confirm failure**

Run: `npm test -- ranking`
Expected: FAIL.

- [ ] **Step 3: Implement ranking**

Create `lib/ranking.ts`:
```ts
export interface LogRow { foodId: string; date: string; }

export function recentFoodIds(rows: LogRow[], limit: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of rows) {
    if (!seen.has(r.foodId)) {
      seen.add(r.foodId);
      out.push(r.foodId);
      if (out.length >= limit) break;
    }
  }
  return out;
}

export function frequentFoodIds(rows: LogRow[], limit: number): string[] {
  const count = new Map<string, number>();
  const firstIndex = new Map<string, number>();
  rows.forEach((r, i) => {
    count.set(r.foodId, (count.get(r.foodId) ?? 0) + 1);
    if (!firstIndex.has(r.foodId)) firstIndex.set(r.foodId, i);
  });
  return [...count.keys()]
    .sort((a, b) => {
      const c = (count.get(b)! - count.get(a)!);
      if (c !== 0) return c;
      return firstIndex.get(a)! - firstIndex.get(b)!; // earlier index = more recent
    })
    .slice(0, limit);
}
```

- [ ] **Step 4: Run tests**

Run: `npm test -- ranking`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/ranking.ts __tests__/ranking.test.ts
git commit -m "feat: add recents/frequents ranking (TDD)"
```

---

## Task 9: SQLite schema + DB init

**Files:**
- Create: `db/schema.ts`, `db/index.ts`

**Interfaces:**
- Produces:
  - `getDb(): SQLiteDatabase` — opens `nutrition.db`.
  - `initDb(): Promise<void>` — runs `CREATE TABLE IF NOT EXISTS` + ensures a single `targets` row.
- Schema columns match `lib/types` field names (snake_case in SQL, mapped in queries).

- [ ] **Step 1: Write schema statements**

Create `db/schema.ts`:
```ts
export const SCHEMA = `
CREATE TABLE IF NOT EXISTS foods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  source TEXT NOT NULL,
  barcode TEXT,
  per100g TEXT NOT NULL,        -- JSON Nutrients
  serving_options TEXT NOT NULL -- JSON ServingOption[]
);

CREATE TABLE IF NOT EXISTS log_entries (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  meal TEXT NOT NULL,
  food_id TEXT,
  name_snapshot TEXT NOT NULL,
  serving_label TEXT NOT NULL,
  quantity REAL NOT NULL,
  computed TEXT NOT NULL         -- JSON Nutrients
);
CREATE INDEX IF NOT EXISTS idx_log_date ON log_entries(date);
CREATE INDEX IF NOT EXISTS idx_log_food ON log_entries(food_id);

CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  ref_type TEXT NOT NULL,        -- 'food' | 'recipe'
  ref_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS targets (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  daily_kcal INTEGER NOT NULL,
  protein_g INTEGER NOT NULL,
  carbs_g INTEGER NOT NULL,
  fat_g INTEGER NOT NULL
);
`;

export const DEFAULT_TARGET = {
  dailyKcal: 2000, proteinG: 150, carbsG: 200, fatG: 67,
};
```

- [ ] **Step 2: Implement DB init**

Create `db/index.ts`:
```ts
import * as SQLite from 'expo-sqlite';
import { SCHEMA, DEFAULT_TARGET } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!db) db = SQLite.openDatabaseSync('nutrition.db');
  return db;
}

export async function initDb(): Promise<void> {
  const d = getDb();
  await d.execAsync(SCHEMA);
  const row = await d.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM targets');
  if (!row || row.c === 0) {
    await d.runAsync(
      'INSERT INTO targets (id, daily_kcal, protein_g, carbs_g, fat_g) VALUES (1, ?, ?, ?, ?)',
      [DEFAULT_TARGET.dailyKcal, DEFAULT_TARGET.proteinG, DEFAULT_TARGET.carbsG, DEFAULT_TARGET.fatG],
    );
  }
}
```

- [ ] **Step 3: Wire init into the root layout**

In `app/_layout.tsx`, add a state gate that calls `initDb()` before rendering the stack. Replace the body:
```tsx
import { useEffect, useState } from 'react';
import { initDb } from '../db';
// ...inside RootLayout, after useFonts:
const [dbReady, setDbReady] = useState(false);
useEffect(() => { initDb().then(() => setDbReady(true)); }, []);
if (!loaded || !dbReady) return null;
```
(Keep the existing `StatusBar` + `Stack` return.)

- [ ] **Step 4: Verify by running**

Run: `npx expo start` → open app.
Expected: app boots with no SQLite errors (tables created on first launch).

- [ ] **Step 5: Commit**

```bash
git add db/schema.ts db/index.ts app/_layout.tsx
git commit -m "feat: add SQLite schema and DB init"
```

---

## Task 10: Query helpers (foods, log entries, targets, favorites)

**Files:**
- Create: `db/queries.ts`

**Interfaces:**
- Consumes: `getDb()`, types from `lib/types`, `recentFoodIds`/`frequentFoodIds` from `lib/ranking`.
- Produces (all async):
  - `upsertFood(food: Food): Promise<void>`
  - `getFood(id): Promise<Food | null>`
  - `searchFoods(q: string, limit?): Promise<Food[]>`
  - `insertLogEntry(e: LogEntry): Promise<void>`
  - `deleteLogEntry(id: string): Promise<void>`
  - `getEntriesForDate(date: string): Promise<LogEntry[]>`
  - `getRecentFoods(limit): Promise<Food[]>` / `getFrequentFoods(limit): Promise<Food[]>`
  - `getTarget(): Promise<Target>` / `setTarget(t: Target): Promise<void>`
  - `toggleFavorite(refType, refId): Promise<void>` / `getFavoriteFoodIds(): Promise<string[]>`

- [ ] **Step 1: Implement row<->object mappers + food queries**

Create `db/queries.ts`:
```ts
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
```

- [ ] **Step 2: Add log-entry + targets + favorites queries (append to `db/queries.ts`)**

```ts
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
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no type errors.

- [ ] **Step 4: Commit**

```bash
git add db/queries.ts
git commit -m "feat: add SQLite query helpers"
```

---

## Task 11: Seed foods + loader

**Files:**
- Create: `assets/data/seed-foods.json`, `db/seed.ts`
- Modify: `app/_layout.tsx` (call `seedIfEmpty()` after `initDb`)

**Interfaces:**
- Produces: `seedIfEmpty(): Promise<void>` — inserts seed foods only when `foods` is empty.

- [ ] **Step 1: Create the seed file**

Create `assets/data/seed-foods.json` with at least 30 common foods (expand toward ~100 as desired). Each object matches `Food`. Example (include the full set; three shown here for format):
```json
[
  { "id": "seed_banana", "name": "Banana", "brand": null, "source": "custom", "barcode": null,
    "per100g": { "kcal": 89, "protein": 1.1, "carbs": 22.8, "fat": 0.3, "fiber": 2.6, "sugar": 12.2, "sodium": 1, "satFat": 0.1 },
    "servingOptions": [ { "label": "1 medium", "grams": 118 }, { "label": "100 g", "grams": 100 } ] },
  { "id": "seed_rice_cooked", "name": "White rice, cooked", "brand": null, "source": "custom", "barcode": null,
    "per100g": { "kcal": 130, "protein": 2.7, "carbs": 28, "fat": 0.3, "fiber": 0.4, "sugar": 0.1, "sodium": 1, "satFat": 0.1 },
    "servingOptions": [ { "label": "1 cup", "grams": 158 }, { "label": "100 g", "grams": 100 } ] },
  { "id": "seed_egg", "name": "Egg, large", "brand": null, "source": "custom", "barcode": null,
    "per100g": { "kcal": 143, "protein": 12.6, "carbs": 0.7, "fat": 9.5, "fiber": 0, "sugar": 0.4, "sodium": 142, "satFat": 3.1 },
    "servingOptions": [ { "label": "1 large", "grams": 50 }, { "label": "100 g", "grams": 100 } ] }
]
```

- [ ] **Step 2: Implement the loader**

Create `db/seed.ts`:
```ts
import { getDb } from './index';
import { upsertFood } from './queries';
import { Food } from '../lib/types';
import seed from '../assets/data/seed-foods.json';

export async function seedIfEmpty(): Promise<void> {
  const row = await getDb().getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM foods');
  if (row && row.c > 0) return;
  for (const f of seed as Food[]) {
    await upsertFood(f);
  }
}
```
Ensure `tsconfig.json` has `"resolveJsonModule": true` (Expo's default tsconfig extends `expo/tsconfig.base`, which enables it; add it explicitly if missing).

- [ ] **Step 3: Call it from root layout**

In `app/_layout.tsx`, change the init effect to seed after init:
```tsx
useEffect(() => {
  (async () => { await initDb(); await seedIfEmpty(); setDbReady(true); })();
}, []);
```
Add `import { seedIfEmpty } from '../db/seed';`.

- [ ] **Step 4: Verify by running**

Run: `npx expo start` → app boots. (Visual confirmation comes in Task 13 when search shows seed foods.)
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add assets/data/seed-foods.json db/seed.ts app/_layout.tsx tsconfig.json
git commit -m "feat: seed common foods on first launch"
```

---

## Task 12: App context (selected date + target)

**Files:**
- Create: `state/AppContext.tsx`, `lib/date.ts`
- Modify: `app/_layout.tsx` (wrap Stack in provider)

**Interfaces:**
- Produces:
  - `todayISO(): string` (YYYY-MM-DD, local).
  - `useApp()` → `{ selectedDate, setSelectedDate, target, refreshTarget }`.

- [ ] **Step 1: Date helper**

Create `lib/date.ts`:
```ts
export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function shiftISO(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d + days);
  return todayISOFrom(dt);
}

function todayISOFrom(dt: Date): string {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
```

- [ ] **Step 2: Implement the context**

Create `state/AppContext.tsx`:
```tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { Target } from '../lib/types';
import { getTarget } from '../db/queries';
import { todayISO } from '../lib/date';

interface AppState {
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  target: Target;
  refreshTarget: () => Promise<void>;
}
const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [target, setTarget] = useState<Target>({ dailyKcal: 2000, proteinG: 150, carbsG: 200, fatG: 67 });
  const refreshTarget = async () => setTarget(await getTarget());
  useEffect(() => { refreshTarget(); }, []);
  return (
    <Ctx.Provider value={{ selectedDate, setSelectedDate, target, refreshTarget }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used within AppProvider');
  return v;
}
```

- [ ] **Step 3: Wrap the app**

In `app/_layout.tsx`, import `AppProvider` and wrap `<Stack .../>` with `<AppProvider>...</AppProvider>`.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit` → no errors. `npx expo start` → app boots.

- [ ] **Step 5: Commit**

```bash
git add state/AppContext.tsx lib/date.ts app/_layout.tsx
git commit -m "feat: add app context for selected date and target"
```

---

## Task 13: MacroRing + MacroBar components

**Files:**
- Create: `components/nutrition/MacroRing.tsx`, `components/nutrition/MacroBar.tsx`
- Install: `npx expo install react-native-svg`

**Interfaces:**
- Consumes: `colors`, `macroColors`, `fillPercent`.
- Produces:
  - `MacroRing({ consumed, target })` — circular calorie ring; center shows remaining.
  - `MacroBar({ label, consumed, target, color })` — labeled MeterBar with `Ng / Mg (P%)`.

- [ ] **Step 1: Install SVG**

Run: `npx expo install react-native-svg`

- [ ] **Step 2: Implement MacroRing**

Create `components/nutrition/MacroRing.tsx`:
```tsx
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, macroColors, type } from '../../theme';

export function MacroRing({ consumed, target }: { consumed: number; target: number }) {
  const size = 180, stroke = 14, r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = target > 0 ? Math.min(1, consumed / target) : 0;
  const remaining = target - consumed;
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.secondary} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={macroColors.calories} strokeWidth={stroke} fill="none"
          strokeDasharray={`${circ} ${circ}`} strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round" rotation={-90} origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: 32 }}>
          {Math.max(0, Math.round(remaining))}
        </Text>
        <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.caption }}>
          {remaining >= 0 ? 'kcal left' : 'kcal over'}
        </Text>
      </View>
    </View>
  );
}
```

- [ ] **Step 3: Implement MacroBar**

Create `components/nutrition/MacroBar.tsx`:
```tsx
import { View, Text } from 'react-native';
import { MeterBar } from '../ui/MeterBar';
import { macroPercentOfTarget } from '../../lib/totals';
import { colors, type } from '../../theme';

export function MacroBar({
  label, consumed, target, color,
}: { label: string; consumed: number; target: number; color: string }) {
  const pct = macroPercentOfTarget(consumed, target);
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.text, fontFamily: type.familyMedium, fontSize: type.bodySm }}>{label}</Text>
        <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.caption }}>
          {Math.round(consumed)}g / {target}g ({pct}%)
        </Text>
      </View>
      <MeterBar value={consumed} max={target} color={color} />
    </View>
  );
}
```

- [ ] **Step 4: Verify by running**

Temporarily render `<MacroRing consumed={1400} target={2000} />` in `index.tsx`.
Expected: amber arc ~70% around the ring, "600 / kcal left" centered. Revert.

- [ ] **Step 5: Commit**

```bash
git add components/nutrition/MacroRing.tsx components/nutrition/MacroBar.tsx package.json package-lock.json
git commit -m "feat: add MacroRing and MacroBar"
```

---

## Task 14: Today screen

**Files:**
- Create: `components/nutrition/MealSection.tsx`
- Modify: `app/(tabs)/index.tsx`

**Interfaces:**
- Consumes: `useApp`, `getEntriesForDate`, `deleteLogEntry`, `sumNutrients`, `MacroRing`, `MacroBar`, `MealSection`.
- Produces: a Today screen showing date, calorie ring, three macro bars, and meal-grouped entries; pull-to-refresh re-reads the day; tapping an entry deletes it (with confirm).

- [ ] **Step 1: Implement MealSection**

Create `components/nutrition/MealSection.tsx`:
```tsx
import { View } from 'react-native';
import { LogEntry, MealId, MEAL_LABELS } from '../../lib/types';
import { SectionLabel } from '../ui/SectionLabel';
import { ListRow } from '../ui/ListRow';
import { spacing, colors, type } from '../../theme';
import { Text } from 'react-native';

export function MealSection({
  meal, entries, onPressEntry,
}: { meal: MealId; entries: LogEntry[]; onPressEntry: (e: LogEntry) => void }) {
  if (entries.length === 0) return null;
  return (
    <View style={{ gap: spacing.sm }}>
      <SectionLabel>{MEAL_LABELS[meal]}</SectionLabel>
      {entries.map(e => (
        <ListRow
          key={e.id}
          title={e.nameSnapshot}
          subtitle={`${e.quantity} × ${e.servingLabel}`}
          onPress={() => onPressEntry(e)}
          trailing={
            <Text style={{ color: colors.text, fontFamily: type.familySemibold, fontSize: type.bodySm }}>
              {e.computed.kcal} kcal
            </Text>
          }
        />
      ))}
    </View>
  );
}
```

- [ ] **Step 2: Implement the Today screen**

Replace `app/(tabs)/index.tsx`:
```tsx
import { useCallback, useState } from 'react';
import { ScrollView, View, Text, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useApp } from '../../state/AppContext';
import { getEntriesForDate, deleteLogEntry } from '../../db/queries';
import { sumNutrients } from '../../lib/totals';
import { LogEntry, MEALS, MealId } from '../../lib/types';
import { MacroRing } from '../../components/nutrition/MacroRing';
import { MacroBar } from '../../components/nutrition/MacroBar';
import { MealSection } from '../../components/nutrition/MealSection';
import { Card } from '../../components/ui/Card';
import { colors, macroColors, spacing, type } from '../../theme';

export default function Today() {
  const { selectedDate, target } = useApp();
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setEntries(await getEntriesForDate(selectedDate));
  }, [selectedDate]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const totals = sumNutrients(entries);
  const byMeal = (m: MealId) => entries.filter(e => e.meal === m);

  const onPressEntry = (e: LogEntry) => {
    Alert.alert('Remove entry?', e.nameSnapshot, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => { await deleteLogEntry(e.id); load(); } },
    ]);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.canvas }}
      contentContainerStyle={{ padding: spacing.gutter, gap: spacing.base, paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={colors.textMuted} />}
    >
      <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.screenTitle }}>Today</Text>

      <Card style={{ alignItems: 'center', gap: spacing.base }}>
        <MacroRing consumed={totals.kcal} target={target.dailyKcal} />
        <View style={{ alignSelf: 'stretch', gap: spacing.md }}>
          <MacroBar label="Protein" consumed={totals.protein} target={target.proteinG} color={macroColors.protein} />
          <MacroBar label="Carbs" consumed={totals.carbs} target={target.carbsG} color={macroColors.carbs} />
          <MacroBar label="Fat" consumed={totals.fat} target={target.fatG} color={macroColors.fat} />
        </View>
      </Card>

      {entries.length === 0 && (
        <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.bodySm, textAlign: 'center', marginTop: spacing.lg }}>
          Nothing logged yet. Tap Add to log a food.
        </Text>
      )}

      {MEALS.map(m => (
        <MealSection key={m} meal={m} entries={byMeal(m)} onPressEntry={onPressEntry} />
      ))}
    </ScrollView>
  );
}
```

- [ ] **Step 3: Verify by running**

Run: `npx expo start`. Today shows the ring + macro bars + empty hint. (Entries appear after Task 16.)
Expected: amber ring, three macro bars, "Nothing logged yet."

- [ ] **Step 4: Commit**

```bash
git add components/nutrition/MealSection.tsx app/\(tabs\)/index.tsx
git commit -m "feat: add Today dashboard"
```

---

## Task 15: PortionStepper + FoodSearchRow

**Files:**
- Create: `components/nutrition/PortionStepper.tsx`, `components/nutrition/FoodSearchRow.tsx`

**Interfaces:**
- Produces:
  - `PortionStepper({ food, onChange })` → reports `{ servingLabel, quantity, grams, nutrients }` whenever the user changes serving, multiplier, or gram override.
  - `FoodSearchRow({ food, isFavorite, onPress, onToggleFavorite })`.

- [ ] **Step 1: Implement PortionStepper**

Create `components/nutrition/PortionStepper.tsx`:
```tsx
import { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Food } from '../../lib/types';
import { computeEntryNutrition } from '../../lib/nutrition';
import { Field } from '../ui/Field';
import { colors, radii, spacing, type } from '../../theme';

const MULTIPLIERS = [0.5, 1, 1.5, 2];

export interface PortionSelection {
  servingLabel: string; quantity: number; grams: number;
  nutrients: ReturnType<typeof computeEntryNutrition>;
}

export function PortionStepper({ food, onChange }: { food: Food; onChange: (s: PortionSelection) => void }) {
  const [serving, setServing] = useState(food.servingOptions[0]);
  const [multiplier, setMultiplier] = useState(1);
  const [gramOverride, setGramOverride] = useState('');

  useEffect(() => {
    const grams = gramOverride ? Number(gramOverride) || 0 : serving.grams * multiplier;
    const label = gramOverride ? `${grams} g` : serving.label;
    const quantity = gramOverride ? 1 : multiplier;
    const servingGrams = gramOverride ? grams : serving.grams;
    onChange({
      servingLabel: label, quantity, grams,
      nutrients: computeEntryNutrition(food.per100g, servingGrams, quantity),
    });
  }, [serving, multiplier, gramOverride]);

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {food.servingOptions.map(opt => (
          <Pressable
            key={opt.label}
            onPress={() => { setServing(opt); setGramOverride(''); }}
            style={{
              paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
              borderRadius: radii.control, borderWidth: 1,
              borderColor: !gramOverride && serving.label === opt.label ? colors.amber : colors.border,
              backgroundColor: colors.secondary,
            }}
          >
            <Text style={{ color: colors.text, fontFamily: type.familyMedium, fontSize: type.bodySm }}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {MULTIPLIERS.map(m => (
          <Pressable
            key={m}
            onPress={() => { setMultiplier(m); setGramOverride(''); }}
            style={{
              flex: 1, alignItems: 'center', paddingVertical: spacing.sm,
              borderRadius: radii.control, borderWidth: 1,
              borderColor: !gramOverride && multiplier === m ? colors.amber : colors.border,
              backgroundColor: colors.secondary,
            }}
          >
            <Text style={{ color: colors.text, fontFamily: type.familyMedium, fontSize: type.bodySm }}>{m}×</Text>
          </Pressable>
        ))}
      </View>

      <Field
        value={gramOverride}
        onChangeText={setGramOverride}
        placeholder="or enter exact grams"
        keyboardType="numeric"
      />
    </View>
  );
}
```

- [ ] **Step 2: Implement FoodSearchRow**

Create `components/nutrition/FoodSearchRow.tsx`:
```tsx
import { Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Food } from '../../lib/types';
import { ListRow } from '../ui/ListRow';
import { IconTile } from '../ui/IconTile';
import { colors } from '../../theme';

export function FoodSearchRow({
  food, isFavorite, onPress, onToggleFavorite,
}: { food: Food; isFavorite: boolean; onPress: () => void; onToggleFavorite: () => void }) {
  return (
    <ListRow
      icon={<IconTile color={colors.amber}><Feather name="box" size={18} color={colors.amber} /></IconTile>}
      title={food.name}
      subtitle={food.brand ?? `${food.per100g.kcal} kcal / 100 g`}
      onPress={onPress}
      trailing={
        <Pressable onPress={onToggleFavorite} hitSlop={10}>
          <Feather name="star" size={18} color={isFavorite ? colors.amber : colors.textMuted} />
        </Pressable>
      }
    />
  );
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit` → no errors.

- [ ] **Step 4: Commit**

```bash
git add components/nutrition/PortionStepper.tsx components/nutrition/FoodSearchRow.tsx
git commit -m "feat: add PortionStepper and FoodSearchRow"
```

---

## Task 16: Add flow (search → portion → meal → log)

**Files:**
- Modify: `app/(tabs)/add.tsx`
- Create: `app/log/[foodId].tsx` (portion + meal picker modal screen)
- Modify: `app/_layout.tsx` (register the `log` route in the Stack)

**Interfaces:**
- Consumes: `searchFoods`, `getRecentFoods`, `getFrequentFoods`, `getFavoriteFoodIds`, `toggleFavorite`, `getFood`, `insertLogEntry`, `PortionStepper`, `FoodSearchRow`, `useApp`.
- Produces: searchable Add tab; selecting a food opens `/log/<id>` where the user sets portion + meal and logs an entry that appears on Today.

- [ ] **Step 1: Add tab — search + recents/frequents/favorites**

Replace `app/(tabs)/add.tsx`:
```tsx
import { useCallback, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Field } from '../../components/ui/Field';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { FoodSearchRow } from '../../components/nutrition/FoodSearchRow';
import { searchFoods, getRecentFoods, getFrequentFoods, getFavoriteFoodIds, toggleFavorite } from '../../db/queries';
import { Food } from '../../lib/types';
import { colors, spacing, type } from '../../theme';

export default function Add() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [recents, setRecents] = useState<Food[]>([]);
  const [frequents, setFrequents] = useState<Food[]>([]);
  const [favIds, setFavIds] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    setRecents(await getRecentFoods(8));
    setFrequents(await getFrequentFoods(8));
    setFavIds(await getFavoriteFoodIds());
  }, []);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const onSearch = async (text: string) => {
    setQ(text);
    setResults(text.trim().length >= 2 ? await searchFoods(text.trim()) : []);
  };

  const onToggleFav = async (id: string) => { await toggleFavorite('food', id); setFavIds(await getFavoriteFoodIds()); };

  const row = (f: Food) => (
    <FoodSearchRow
      key={f.id} food={f} isFavorite={favIds.includes(f.id)}
      onPress={() => router.push(`/log/${f.id}`)}
      onToggleFavorite={() => onToggleFav(f.id)}
    />
  );

  const favorites = [...recents, ...frequents].filter((f, i, arr) =>
    favIds.includes(f.id) && arr.findIndex(x => x.id === f.id) === i);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.canvas }}
      contentContainerStyle={{ padding: spacing.gutter, gap: spacing.base, paddingBottom: 120 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.screenTitle }}>Add food</Text>
      <Field value={q} onChangeText={onSearch} placeholder="Search foods…" autoCorrect={false} />

      {q.trim().length >= 2 ? (
        <View style={{ gap: spacing.sm }}>
          <SectionLabel>Results</SectionLabel>
          {results.length === 0
            ? <Text style={{ color: colors.textMuted, fontFamily: type.family }}>No matches.</Text>
            : results.map(row)}
        </View>
      ) : (
        <>
          {favorites.length > 0 && <View style={{ gap: spacing.sm }}><SectionLabel>Favorites</SectionLabel>{favorites.map(row)}</View>}
          {recents.length > 0 && <View style={{ gap: spacing.sm }}><SectionLabel>Recent</SectionLabel>{recents.map(row)}</View>}
          {frequents.length > 0 && <View style={{ gap: spacing.sm }}><SectionLabel>Frequent</SectionLabel>{frequents.map(row)}</View>}
        </>
      )}
    </ScrollView>
  );
}
```

- [ ] **Step 2: Register a modal Stack for the log route**

In `app/_layout.tsx`, change the `<Stack>` to declare screens:
```tsx
<Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }}>
  <Stack.Screen name="(tabs)" />
  <Stack.Screen name="log/[foodId]" options={{ presentation: 'modal' }} />
</Stack>
```

- [ ] **Step 3: Implement the log screen**

Create `app/log/[foodId].tsx`:
```tsx
import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Food, MealId, MEALS, MEAL_LABELS, LogEntry } from '../../lib/types';
import { getFood, insertLogEntry } from '../../db/queries';
import { PortionStepper, PortionSelection } from '../../components/nutrition/PortionStepper';
import { Button } from '../../components/ui/Button';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { useApp } from '../../state/AppContext';
import { colors, radii, spacing, type } from '../../theme';

export default function LogFood() {
  const { foodId } = useLocalSearchParams<{ foodId: string }>();
  const { selectedDate } = useApp();
  const [food, setFood] = useState<Food | null>(null);
  const [meal, setMeal] = useState<MealId>('breakfast');
  const [sel, setSel] = useState<PortionSelection | null>(null);

  useEffect(() => { getFood(foodId).then(setFood); }, [foodId]);
  if (!food) return null;

  const log = async () => {
    if (!sel) return;
    const entry: LogEntry = {
      id: `log_${Date.now()}`, date: selectedDate, meal,
      foodId: food.id, nameSnapshot: food.name,
      servingLabel: sel.servingLabel, quantity: sel.quantity, computed: sel.nutrients,
    };
    await insertLogEntry(entry);
    router.back();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas }} contentContainerStyle={{ padding: spacing.gutter, gap: spacing.base }}>
      <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.heading }}>{food.name}</Text>

      <View style={{ gap: spacing.sm }}>
        <SectionLabel>Meal</SectionLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {MEALS.map(m => (
            <Pressable key={m} onPress={() => setMeal(m)}
              style={{
                paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.control,
                borderWidth: 1, borderColor: meal === m ? colors.amber : colors.border, backgroundColor: colors.secondary,
              }}>
              <Text style={{ color: colors.text, fontFamily: type.familyMedium, fontSize: type.bodySm }}>{MEAL_LABELS[m]}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ gap: spacing.sm }}>
        <SectionLabel>Portion</SectionLabel>
        <PortionStepper food={food} onChange={setSel} />
      </View>

      {sel && (
        <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.bodySm }}>
          {sel.nutrients.kcal} kcal · {sel.nutrients.protein}g P · {sel.nutrients.carbs}g C · {sel.nutrients.fat}g F
        </Text>
      )}

      <Button onPress={log}>Log to {MEAL_LABELS[meal]}</Button>
    </ScrollView>
  );
}
```

- [ ] **Step 4: Verify the full loop by running**

Run: `npx expo start`. Add tab → search "ban" → tap Banana → pick Lunch, 1.5× → Log → Today shows the banana under Lunch with kcal, and the ring advances. Pull-to-refresh on Today, re-open Add: Banana now appears under Recent.
Expected: end-to-end logging works; recents populate.

- [ ] **Step 5: Commit**

```bash
git add "app/(tabs)/add.tsx" "app/log/[foodId].tsx" app/_layout.tsx
git commit -m "feat: add search-to-log flow with recents/frequents/favorites"
```

---

## Task 17: Settings — manual targets

**Files:**
- Modify: `app/(tabs)/settings.tsx`

**Interfaces:**
- Consumes: `useApp` (`target`, `refreshTarget`), `setTarget`, `Field`, `Button`.
- Produces: editable calorie + macro-gram targets persisted to SQLite; Today reflects new targets after save.

- [ ] **Step 1: Implement Settings**

Replace `app/(tabs)/settings.tsx`:
```tsx
import { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useApp } from '../../state/AppContext';
import { setTarget } from '../../db/queries';
import { Field } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { Card } from '../../components/ui/Card';
import { colors, spacing, type } from '../../theme';

export default function Settings() {
  const { target, refreshTarget } = useApp();
  const [kcal, setKcal] = useState(String(target.dailyKcal));
  const [p, setP] = useState(String(target.proteinG));
  const [c, setC] = useState(String(target.carbsG));
  const [f, setF] = useState(String(target.fatG));
  const [saved, setSaved] = useState(false);

  const save = async () => {
    await setTarget({
      dailyKcal: Number(kcal) || 0, proteinG: Number(p) || 0,
      carbsG: Number(c) || 0, fatG: Number(f) || 0,
    });
    await refreshTarget();
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const labelled = (label: string, value: string, onChange: (s: string) => void) => (
    <View style={{ gap: spacing.xs }}>
      <SectionLabel>{label}</SectionLabel>
      <Field value={value} onChangeText={onChange} keyboardType="numeric" />
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas }} contentContainerStyle={{ padding: spacing.gutter, gap: spacing.base, paddingBottom: 120 }}>
      <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.screenTitle }}>Settings</Text>
      <Card style={{ gap: spacing.md }}>
        {labelled('Daily calories', kcal, setKcal)}
        {labelled('Protein (g)', p, setP)}
        {labelled('Carbs (g)', c, setC)}
        {labelled('Fat (g)', f, setF)}
        <Button onPress={save}>{saved ? 'Saved ✓' : 'Save targets'}</Button>
      </Card>
    </ScrollView>
  );
}
```

- [ ] **Step 2: Verify by running**

Run: `npx expo start`. Settings → change calories to 1800 → Save → Today's ring "kcal left" reflects 1800 baseline.
Expected: targets persist and Today updates.

- [ ] **Step 3: Commit**

```bash
git add "app/(tabs)/settings.tsx"
git commit -m "feat: add manual target settings"
```

---

## Task 18: Branded TabBar

**Files:**
- Modify: `app/(tabs)/_layout.tsx`

**Interfaces:**
- Produces: a frosted (BlurView) bottom tab bar with Feather icons, amber for active, muted for inactive — the DS "hybrid native" chrome.

- [ ] **Step 1: Implement the tab bar**

Replace `app/(tabs)/_layout.tsx`:
```tsx
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { colors } from '../../theme';

const icon = (name: React.ComponentProps<typeof Feather>['name']) =>
  ({ color, size }: { color: string; size: number }) => <Feather name={name} size={size} color={color} />;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.amber,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { position: 'absolute', borderTopColor: colors.border, backgroundColor: 'transparent' },
        tabBarBackground: () => <BlurView tint="dark" intensity={40} style={StyleSheet.absoluteFill} />,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: icon('home') }} />
      <Tabs.Screen name="add" options={{ title: 'Add', tabBarIcon: icon('plus-circle') }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: icon('calendar') }} />
      <Tabs.Screen name="foods" options={{ title: 'Foods', tabBarIcon: icon('book') }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: icon('sliders') }} />
    </Tabs>
  );
}
```

- [ ] **Step 2: Verify by running**

Run: `npx expo start`.
Expected: frosted bottom bar, amber active icon, Feather glyphs.

- [ ] **Step 3: Commit**

```bash
git add "app/(tabs)/_layout.tsx"
git commit -m "feat: add frosted branded tab bar"
```

---

## Task 19: Full test pass + MVP smoke checklist

**Files:** none (verification task)

- [ ] **Step 1: Run the whole suite**

Run: `npm test`
Expected: all suites pass (tokens, meterbar, nutrition, totals, ranking, smoke).

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual MVP smoke (Expo Go)**

Confirm: log a food (≤3 taps from Add for a recent), see it on Today grouped by meal, ring + macro bars update, remove an entry, change targets in Settings and see Today update, recents/frequents/favorites populate. App is fully offline.

- [ ] **Step 4: Commit any fixes, tag the milestone**

```bash
git add -A
git commit -m "test: green suite + MVP smoke pass" || echo "nothing to commit"
git tag v0.1-mvp
```

---

## Self-Review (against the spec)

- **Effortless logging / ≤3 taps** → Tasks 16 (recents pinned, tap→confirm). ✓
- **Four fixed meals** → `lib/types` MEALS; meal picker in Task 16. ✓
- **Portion picker (presets, ½/1/1.5/2×, gram override)** → Task 15. Visual hints deferred to Plan 2 (noted). ✓ (hints partial)
- **Daily dashboard (calories consumed/target/remaining, macro bars, grouped items, tap to edit)** → Tasks 13–14. ✓
- **Manual targets + macro split** → Task 17. ✓
- **Recents/frequents/favorites** → Tasks 8, 10, 16. ✓
- **Snapshot rule** → `computed` JSON on `log_entries` (Tasks 6, 9, 10, 16). ✓
- **Local-first / offline** → SQLite + seed; no network in Plan 1. ✓
- **Design system port** → Tasks 2–5, 18 (tokens, primitives, frosted tab bar). ✓
- **Deferred to Plan 2+:** USDA, custom foods, recipes, copy-day, History, weight, barcode, photo-AI. (Out of Plan 1 scope by design.)

**Gaps intentionally carried to later plans:** visual portion hints (cheap; fold into Plan 2 PortionStepper), History/Foods tabs remain "TODO" stubs until Plans 2–3.

**Placeholder scan:** none. **Type consistency:** `Nutrients`, `Food`, `LogEntry`, `Target`, `PortionSelection`, `MealId` used consistently across tasks; query function names match their call sites in Tasks 14/16/17.
```
