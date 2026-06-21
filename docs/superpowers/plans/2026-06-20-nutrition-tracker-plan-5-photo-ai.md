# Nutrition Tracker — Plan 5: Photo-AI Portion Estimation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Snap a photo of a meal, have Claude vision estimate the distinct food items + portions + nutrition, present them as **editable rows the user confirms**, and log the confirmed items — never auto-logged.

**Architecture:** Builds on Plans 1–4. Photo capture reuses the already-installed `expo-camera` (`takePictureAsync({ base64: true })`) — no new native module, so a **rebuild, not a prebuild**. The Claude call is a single non-streaming `POST https://api.anthropic.com/v1/messages` via `fetch` (no SDK dependency) using `model: claude-opus-4-8`, a base64 image block, and **structured outputs** (`output_config.format` json_schema) so the response is validated `{ items: [{name, grams, kcal, protein, carbs, fat}] }`. Pure parsing + per-item rescaling are TDD'd. The Anthropic API key is stored locally via the existing `settings` table (Settings screen field).

**Tech Stack:** Existing stack. No new dependencies. Claude API: `claude-opus-4-8` (vision + structured outputs), `anthropic-version: 2023-06-01`.

## Global Constraints

- All prior Global Constraints apply (design tokens, four meals, per-100g elsewhere, rounding kcal/sodium integer + others 1-decimal, snapshot rule, Feather, Inter, no shadows, opacity-only feedback, TS strict).
- **Claude call:** `POST https://api.anthropic.com/v1/messages`, headers `content-type: application/json`, `x-api-key: <key>`, `anthropic-version: 2023-06-01`. Body: `model: "claude-opus-4-8"`, `max_tokens: 1024`, one user message = `[{type:image, source:{type:base64, media_type:"image/jpeg", data}}, {type:text, text: PROMPT}]`, plus `output_config: { format: { type: "json_schema", schema: ITEM_SCHEMA } }`. Do NOT send a `thinking` param (omitted = no thinking on Opus 4.8 — fast/cheap extraction). Do NOT send `temperature`/`top_p`.
- **API key:** from `settings` key `anthropic_api_key`; if blank, the photo flow tells the user to add it in Settings (no DEMO fallback — there isn't one for Anthropic).
- **Model output is estimates for the stated grams** (not per-100g). Editing a row's grams **rescales** kcal/protein/carbs/fat proportionally. Photo estimates fill only kcal+macros; fiber/sugar/sodium/satFat = 0.
- **Never auto-log.** The user reviews/edits/removes rows and taps "Log".
- **`analyzePhoto` never throws** — returns a tagged result (`ok` | `unauthorized` | `refusal` | `network`).
- **Reuse `expo-camera`** for capture; no `expo-image-picker`, no new native dep, no prebuild.

---

## File Structure

```
lib/
  photoAI.ts        # CREATE: ITEM_SCHEMA, PROMPT, EstimatedItem, parseItems, scaleItem, analyzePhoto (TDD the pure parts + mocked fetch)
app/
  photo.tsx         # CREATE: capture -> analyze -> editable rows -> log
  _layout.tsx       # MODIFY: register `photo` route
app/(tabs)/
  add.tsx           # MODIFY: "Snap a meal" button -> /photo
  settings.tsx      # MODIFY: Anthropic API key field
__tests__/
  photoAI.test.ts   # CREATE
```

---

## Task 1: Photo-AI client (TDD)

**Files:**
- Create: `lib/photoAI.ts`
- Test: `__tests__/photoAI.test.ts`

**Interfaces:**
- Produces:
  - `EstimatedItem { name: string; grams: number; kcal: number; protein: number; carbs: number; fat: number }`.
  - `parseItems(jsonText: string): EstimatedItem[]` — parse the model's JSON text, keep well-formed items, clamp negatives to 0; returns [] on bad JSON.
  - `scaleItem(item: EstimatedItem, newGrams: number): EstimatedItem` — rescale kcal/macros by newGrams/item.grams (guard grams<=0 → zeros); kcal integer, macros 1-decimal.
  - `analyzePhoto(base64: string, apiKey: string): Promise<{ ok: true; items: EstimatedItem[] } | { ok: false; reason: 'unauthorized' | 'refusal' | 'network' | 'empty' }>` — never throws.
  - `ITEM_SCHEMA`, `PROMPT` (exported for reuse/testing).

- [ ] **Step 1: Write the failing tests**

Create `__tests__/photoAI.test.ts`:
```ts
import { parseItems, scaleItem, analyzePhoto } from '../lib/photoAI';

describe('parseItems', () => {
  it('parses well-formed items and clamps negatives', () => {
    const json = JSON.stringify({ items: [
      { name: 'Rice', grams: 150, kcal: 195, protein: 4, carbs: 42, fat: 0.5 },
      { name: 'Bad', grams: 100, kcal: -5, protein: 3, carbs: 1, fat: 1 },
    ] });
    const items = parseItems(json);
    expect(items).toHaveLength(2);
    expect(items[0].name).toBe('Rice');
    expect(items[1].kcal).toBe(0); // negative clamped
  });
  it('returns [] on invalid JSON', () => {
    expect(parseItems('not json')).toEqual([]);
  });
  it('returns [] when items missing', () => {
    expect(parseItems(JSON.stringify({ foo: 1 }))).toEqual([]);
  });
});

describe('scaleItem', () => {
  it('rescales nutrition proportionally to new grams', () => {
    const base = { name: 'Rice', grams: 100, kcal: 130, protein: 2.7, carbs: 28, fat: 0.3 };
    const s = scaleItem(base, 150);
    expect(s.grams).toBe(150);
    expect(s.kcal).toBe(195);       // 130 * 1.5
    expect(s.protein).toBe(4.1);    // 2.7 * 1.5 = 4.05 -> 4.1
  });
  it('zeros out when grams <= 0', () => {
    const s = scaleItem({ name: 'X', grams: 100, kcal: 100, protein: 5, carbs: 5, fat: 5 }, 0);
    expect(s.kcal).toBe(0);
    expect(s.grams).toBe(0);
  });
});

describe('analyzePhoto', () => {
  afterEach(() => { jest.restoreAllMocks(); });

  it('returns items on a 200 with structured JSON text', async () => {
    (globalThis as any).fetch = jest.fn(async () => ({
      ok: true, status: 200,
      json: async () => ({ content: [{ type: 'text', text: JSON.stringify({ items: [
        { name: 'Egg', grams: 50, kcal: 72, protein: 6, carbs: 0.4, fat: 5 },
      ] }) }] }),
    }));
    const r = await analyzePhoto('BASE64', 'KEY');
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.items[0].name).toBe('Egg'); }
  });
  it('returns unauthorized on 401', async () => {
    (globalThis as any).fetch = jest.fn(async () => ({ ok: false, status: 401, json: async () => ({}) }));
    expect(await analyzePhoto('B', 'BAD')).toEqual({ ok: false, reason: 'unauthorized' });
  });
  it('returns refusal when stop_reason is refusal', async () => {
    (globalThis as any).fetch = jest.fn(async () => ({
      ok: true, status: 200, json: async () => ({ stop_reason: 'refusal', content: [] }),
    }));
    expect(await analyzePhoto('B', 'K')).toEqual({ ok: false, reason: 'refusal' });
  });
  it('returns network on thrown fetch', async () => {
    (globalThis as any).fetch = jest.fn(async () => { throw new Error('offline'); });
    expect(await analyzePhoto('B', 'K')).toEqual({ ok: false, reason: 'network' });
  });
});
```

- [ ] **Step 2: Run to confirm failure**

Run: `npm test -- photoAI`
Expected: FAIL ("Cannot find module '../lib/photoAI'").

- [ ] **Step 3: Implement `lib/photoAI.ts`**

```ts
import { round1 } from './nutrition';

export interface EstimatedItem {
  name: string; grams: number; kcal: number; protein: number; carbs: number; fat: number;
}

export const ITEM_SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          grams: { type: 'number' },
          kcal: { type: 'number' },
          protein: { type: 'number' },
          carbs: { type: 'number' },
          fat: { type: 'number' },
        },
        required: ['name', 'grams', 'kcal', 'protein', 'carbs', 'fat'],
        additionalProperties: false,
      },
    },
  },
  required: ['items'],
  additionalProperties: false,
} as const;

export const PROMPT =
  'You are a nutrition estimator. Identify each distinct food item visible in this photo. ' +
  'For each, estimate its portion in grams and the total calories and macronutrients (protein, carbs, fat) ' +
  'for that portion. Estimates are fine — be realistic, not precise. Return only the structured data.';

const clamp0 = (n: unknown): number => {
  const v = typeof n === 'number' && Number.isFinite(n) ? n : 0;
  return v < 0 ? 0 : v;
};

export function parseItems(jsonText: string): EstimatedItem[] {
  try {
    const data = JSON.parse(jsonText) as { items?: unknown };
    if (!Array.isArray(data.items)) return [];
    return data.items
      .filter((it): it is Record<string, unknown> => !!it && typeof it === 'object')
      .map((it) => ({
        name: typeof it.name === 'string' ? it.name : 'Item',
        grams: clamp0(it.grams),
        kcal: clamp0(it.kcal),
        protein: clamp0(it.protein),
        carbs: clamp0(it.carbs),
        fat: clamp0(it.fat),
      }));
  } catch {
    return [];
  }
}

export function scaleItem(item: EstimatedItem, newGrams: number): EstimatedItem {
  if (newGrams <= 0 || item.grams <= 0) {
    return { ...item, grams: Math.max(0, newGrams), kcal: 0, protein: 0, carbs: 0, fat: 0 };
  }
  const f = newGrams / item.grams;
  return {
    name: item.name,
    grams: newGrams,
    kcal: Math.round(item.kcal * f),
    protein: round1(item.protein * f),
    carbs: round1(item.carbs * f),
    fat: round1(item.fat * f),
  };
}

type AnalyzeResult =
  | { ok: true; items: EstimatedItem[] }
  | { ok: false; reason: 'unauthorized' | 'refusal' | 'network' | 'empty' };

export async function analyzePhoto(base64: string, apiKey: string): Promise<AnalyzeResult> {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-8',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 } },
            { type: 'text', text: PROMPT },
          ],
        }],
        output_config: { format: { type: 'json_schema', schema: ITEM_SCHEMA } },
      }),
    });
    if (res.status === 401 || res.status === 403) return { ok: false, reason: 'unauthorized' };
    if (!res.ok) return { ok: false, reason: 'network' };
    const data = (await res.json()) as {
      stop_reason?: string;
      content?: { type: string; text?: string }[];
    };
    if (data.stop_reason === 'refusal') return { ok: false, reason: 'refusal' };
    const text = data.content?.find(b => b.type === 'text')?.text ?? '';
    const items = parseItems(text);
    if (items.length === 0) return { ok: false, reason: 'empty' };
    return { ok: true, items };
  } catch {
    return { ok: false, reason: 'network' };
  }
}
```

- [ ] **Step 4: Run tests**

Run: `npm test -- photoAI`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/photoAI.ts __tests__/photoAI.test.ts
git commit -m "feat: add Claude vision photo-AI client (TDD)"
```

---

## Task 2: Settings — Anthropic API key field

**Files:**
- Modify: `app/(tabs)/settings.tsx`

**Interfaces:**
- Consumes: `getSetting`, `setSetting`.
- Produces: an "AI photo estimation" Card with an Anthropic API key Field (loaded from `getSetting('anthropic_api_key')`, saved via `setSetting`), mirroring the existing USDA key card.

- [ ] **Step 1: Add the Anthropic key card**

In `app/(tabs)/settings.tsx`, add state + load (mirror the USDA key card):
```tsx
const [anthropicKey, setAnthropicKey] = useState('');
const [aiSaved, setAiSaved] = useState(false);
useEffect(() => { getSetting('anthropic_api_key').then(v => setAnthropicKey(v ?? '')); }, []);
const saveAiKey = async () => {
  await setSetting('anthropic_api_key', anthropicKey.trim());
  setAiSaved(true);
  setTimeout(() => setAiSaved(false), 1500);
};
```
Render a third Card (below the USDA card, same ScrollView):
```tsx
<Card style={{ gap: spacing.md }}>
  <SectionLabel>AI photo estimation (Anthropic)</SectionLabel>
  <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.caption }}>
    Needed for "Snap a meal". Get a key at console.anthropic.com. Stored on this device; ~a few cents per photo.
  </Text>
  <Field
    value={anthropicKey}
    onChangeText={setAnthropicKey}
    placeholder="Anthropic API key"
    autoCapitalize="none"
    autoCorrect={false}
    secureTextEntry
  />
  <Button variant="secondary" onPress={saveAiKey}>{aiSaved ? 'Saved ✓' : 'Save key'}</Button>
</Card>
```
(`useEffect` is already imported from Task in Plan 2; if not, merge it into the react import. `getSetting`/`setSetting` are already imported in this file from Plan 2.)

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit` clean; `npm test` green.

- [ ] **Step 3: Commit**

```bash
git add "app/(tabs)/settings.tsx"
git commit -m "feat: add Anthropic API key field in settings"
```

---

## Task 3: Photo screen (capture → analyze → editable rows → log) + Add button

**Files:**
- Create: `app/photo.tsx`
- Modify: `app/_layout.tsx` (register `photo` route)
- Modify: `app/(tabs)/add.tsx` ("Snap a meal" button)

**Interfaces:**
- Consumes: `CameraView`/`useCameraPermissions` (expo-camera), `analyzePhoto`/`scaleItem`/`EstimatedItem` (lib/photoAI), `getSetting`, `insertLogEntry`, `useApp`, types (MEALS/MEAL_LABELS/MealId/LogEntry/EMPTY_NUTRIENTS), Field/Button/Card/SectionLabel, theme.
- Produces: `/photo` screen with phases — permission gate → capture (camera + shutter) → analyzing → review (editable rows: name, grams [rescales], remove; meal picker; "Log N items"). Add tab gets a "Snap a meal" button.

- [ ] **Step 1: Photo screen**

Create `app/photo.tsx`:
```tsx
import { useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { analyzePhoto, scaleItem, EstimatedItem } from '../lib/photoAI';
import { getSetting, insertLogEntry } from '../db/queries';
import { useApp } from '../state/AppContext';
import { MEALS, MEAL_LABELS, MealId, LogEntry, EMPTY_NUTRIENTS } from '../lib/types';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { Card } from '../components/ui/Card';
import { SectionLabel } from '../components/ui/SectionLabel';
import { colors, radii, spacing, type } from '../theme';

type Phase = 'capture' | 'analyzing' | 'review';

export default function Photo() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { selectedDate } = useApp();
  const [phase, setPhase] = useState<Phase>('capture');
  const [items, setItems] = useState<EstimatedItem[]>([]);
  const [meal, setMeal] = useState<MealId>('lunch');

  if (!permission) return <View style={{ flex: 1, backgroundColor: colors.canvas }} />;
  if (!permission.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.canvas, padding: spacing.gutter, gap: spacing.base, justifyContent: 'center' }}>
        <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.heading }}>Camera access</Text>
        <Text style={{ color: colors.textSecondary, fontFamily: type.family, fontSize: type.bodySm }}>
          Nutrition needs the camera to estimate a meal from a photo.
        </Text>
        <Button onPress={requestPermission}>Grant camera access</Button>
        <Button variant="secondary" onPress={() => router.back()}>Cancel</Button>
      </View>
    );
  }

  const capture = async () => {
    const key = (await getSetting('anthropic_api_key'))?.trim();
    if (!key) {
      Alert.alert('No API key', 'Add an Anthropic API key in Settings to use photo estimation.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      return;
    }
    const pic = await cameraRef.current?.takePictureAsync({ base64: true, quality: 0.4 });
    if (!pic?.base64) return;
    setPhase('analyzing');
    const result = await analyzePhoto(pic.base64, key);
    if (result.ok) {
      setItems(result.items);
      setPhase('review');
    } else {
      const msg = {
        unauthorized: 'API key rejected — check it in Settings.',
        refusal: "Couldn't analyze that photo. Try another shot.",
        network: 'Network error reaching Claude. Check your connection.',
        empty: 'No food detected. Try a clearer photo.',
      }[result.reason];
      Alert.alert('Estimation failed', msg, [{ text: 'Retry', onPress: () => setPhase('capture') }]);
    }
  };

  const setGrams = (i: number, grams: string) => {
    const n = Number(grams) || 0;
    setItems(prev => prev.map((it, idx) => idx === i ? scaleItem(it, n) : it));
  };
  const setName = (i: number, name: string) => {
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, name } : it));
  };
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const logAll = async () => {
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const entry: LogEntry = {
        id: `log_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 7)}`,
        date: selectedDate, meal, foodId: null, nameSnapshot: it.name,
        servingLabel: `${it.grams} g`, quantity: 1,
        computed: { ...EMPTY_NUTRIENTS, kcal: it.kcal, protein: it.protein, carbs: it.carbs, fat: it.fat },
      };
      await insertLogEntry(entry);
    }
    router.back();
  };

  if (phase === 'capture') {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} />
        <View style={{ position: 'absolute', bottom: 48, left: 0, right: 0, alignItems: 'center', gap: spacing.md }}>
          <Text style={{ color: '#fff', fontFamily: type.familyMedium, fontSize: type.bodySm }}>Frame your meal, then capture</Text>
          <View style={{ width: 220, gap: spacing.sm }}>
            <Button onPress={capture}>Capture</Button>
            <Button variant="secondary" onPress={() => router.back()}>Cancel</Button>
          </View>
        </View>
      </View>
    );
  }

  if (phase === 'analyzing') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
        <Text style={{ color: colors.text, fontFamily: type.familySemibold, fontSize: type.body }}>Estimating your meal…</Text>
        <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.caption }}>Asking Claude to read the photo</Text>
      </View>
    );
  }

  // review
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas }} contentContainerStyle={{ padding: spacing.gutter, gap: spacing.base, paddingBottom: 40 }}>
      <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.heading }}>Confirm items</Text>
      <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.caption }}>
        AI estimates — edit grams or names, remove anything wrong, then log.
      </Text>

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

      {items.map((it, i) => (
        <Card key={i} style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <View style={{ flex: 1 }}><Field value={it.name} onChangeText={t => setName(i, t)} /></View>
            <Pressable onPress={() => removeItem(i)} hitSlop={10}>
              <Text style={{ color: colors.danger, fontFamily: type.familyMedium, fontSize: type.bodySm }}>Remove</Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <View style={{ width: 110 }}>
              <Field value={String(it.grams)} onChangeText={t => setGrams(i, t)} keyboardType="numeric" placeholder="grams" />
            </View>
            <Text style={{ color: colors.textSecondary, fontFamily: type.family, fontSize: type.bodySm }}>
              {it.kcal} kcal · {it.protein}P {it.carbs}C {it.fat}F
            </Text>
          </View>
        </Card>
      ))}

      {items.length === 0 ? (
        <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.bodySm }}>No items left.</Text>
      ) : (
        <Button onPress={logAll}>Log {items.length} item{items.length === 1 ? '' : 's'} to {MEAL_LABELS[meal]}</Button>
      )}
      <Button variant="secondary" onPress={() => setPhase('capture')}>Retake</Button>
    </ScrollView>
  );
}
```

- [ ] **Step 2: Register the route**

In `app/_layout.tsx`, add inside `<Stack>` (keep existing):
```tsx
<Stack.Screen name="photo" options={{ presentation: 'modal' }} />
```

- [ ] **Step 3: Add-tab "Snap a meal" button**

In `app/(tabs)/add.tsx`, next to the existing "Scan barcode" button, add:
```tsx
<Button variant="secondary" icon={<Feather name="camera" size={16} color={colors.text} />} onPress={() => router.push('/photo')}>
  Snap a meal
</Button>
```

- [ ] **Step 4: Verify (headless — camera + live AI can't run here)**

Run: `npx tsc --noEmit` clean; `npm test` green; `npx expo export --platform ios` bundles.
Do NOT run `npx expo start`. (Capture + live Claude call verified on device by the human.)

- [ ] **Step 5: Commit**

```bash
git add app/photo.tsx app/_layout.tsx "app/(tabs)/add.tsx"
git commit -m "feat: photo-AI capture, review, and logging flow"
```

---

## Task 4: Full test pass + rebuild to device

**Files:** none (verification + deploy)

- [ ] **Step 1: Suite + types**

Run: `npm test` (expect all green incl. photoAI) and `npx tsc --noEmit` (clean).

- [ ] **Step 2: Rebuild to the iPhone**

No new native deps (reused expo-camera) — rebuild Release + install (no prebuild needed):
```bash
cd ios && xcodebuild -workspace Nutrition.xcworkspace -scheme Nutrition -configuration Release \
  -destination 'id=00008101-0006695A3E04001E' -derivedDataPath build -allowProvisioningUpdates \
  DEVELOPMENT_TEAM=549PHBVV44 CODE_SIGN_STYLE=Automatic build \
  && xcrun devicectl device install app --device 00008101-0006695A3E04001E \
     "$(pwd)/build/Build/Products/Release-iphoneos/Nutrition.app"
```
Expected: BUILD SUCCEEDED + install exit 0.

- [ ] **Step 3: Manual on-device smoke (human)**

Confirm: add an Anthropic key in Settings; Add → Snap a meal → capture a plate → items appear as editable rows; edit grams (kcal rescales), remove a row, pick a meal, Log → entries appear on Today. With no key set, the flow tells you to add one.

- [ ] **Step 4: Tag**

```bash
cd /Users/argynbyek/Desktop/VibeCoding/Nutrition && git tag v0.5 && echo tagged
```

---

## Self-Review (against spec + prior plans)

- **Photo / AI estimation** → Tasks 1, 3 (Claude vision, structured output). ✓
- **Always editable, never auto-logged** → Task 3 (review rows: edit name/grams, remove, then Log). ✓
- **Anthropic key in Settings** → Task 2 (no DEMO fallback; flow guards on missing key). ✓
- **Rescale on grams edit** → Tasks 1, 3 (`scaleItem`, TDD). ✓
- **No new native dep** (reuse expo-camera) → rebuild only, no prebuild. ✓
- **Honest failure messages** (unauthorized/refusal/network/empty) → Tasks 1, 3. ✓

**Placeholder scan:** none. **Type consistency:** `EstimatedItem`, `AnalyzeResult`, `LogEntry`, query/route names consistent; `scaleItem`/`analyzePhoto`/`parseItems` signatures match callers. **API correctness:** model `claude-opus-4-8`, `output_config.format` json_schema (not deprecated `output_format`), no `thinking`/`temperature` params, `anthropic-version: 2023-06-01` header. **Risk to watch during impl:** `takePictureAsync` option/return shape and `CameraView` ref typing against the installed expo-camera — verify and adjust if the installed API differs; base64 payload size (quality 0.4 keeps it modest).
