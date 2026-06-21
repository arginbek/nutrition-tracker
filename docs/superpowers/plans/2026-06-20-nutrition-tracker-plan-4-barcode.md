# Nutrition Tracker — Plan 4: Barcode Scanner

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scan a packaged product's barcode with the camera, look it up in Open Food Facts, and drop it into the log flow — with a graceful "not found → add as custom food" fallback.

**Architecture:** Builds on Plans 1–3. A pure Open Food Facts mapper + a `lookupBarcode` network fn (TDD with fixtures + mocked fetch, same pattern as USDA). A camera Scanner screen using **`expo-camera`** (`CameraView` + `useCameraPermissions` + barcode settings) that resolves a scan → cached `Food` → existing `/log/<id>` portion flow. **`expo-camera` is a new native module**, so this plan's deploy re-runs `expo prebuild` (regenerating `ios/` with the camera pod + `NSCameraUsageDescription`) before the Release build.

**Tech Stack:** Existing stack + **`expo-camera`** (new native dep). Open Food Facts via `fetch` (no key).

## Global Constraints

- All prior Global Constraints still apply (design tokens, four meals, per-100g math, rounding, snapshot rule, Feather icons, Inter, no shadows, opacity-only feedback, TS strict).
- **Open Food Facts:** `GET https://world.openfoodfacts.org/api/v2/product/<barcode>.json?fields=code,product_name,brands,serving_size,nutriments`. Found when `data.product` (with `nutriments`) is present; else not found. `lookupBarcode` never throws (returns `null` on any error/not-found).
- **OFF nutriment keys** (all per-100g) → our `Nutrients`: `energy-kcal_100g`→kcal (integer), `proteins_100g`→protein, `carbohydrates_100g`→carbs, `fat_100g`→fat, `fiber_100g`→fiber, `sugars_100g`→sugar, `sodium_100g`→sodium **in grams → multiply by 1000 for mg** (integer), `saturated-fat_100g`→satFat. Missing → 0.
- **OFF food id** `off_<barcode>`, `source: "openfoodfacts"`, `barcode` set. Cached via `upsertFood` so it's loggable/recents-able/offline.
- **Camera permission** copy: "Allow Nutrition to scan barcodes." Barcode types: EAN-13, EAN-8, UPC-A, UPC-E.
- **`expo-camera` is a new native dependency** → after install + app.json plugin, the project must be re-prebuilt before the next device build.

---

## File Structure

```
lib/
  types.ts            # (Food.source already includes 'openfoodfacts' — no change expected)
  openfoodfacts.ts    # CREATE: offProductToFood mapper + lookupBarcode (TDD)
app/
  scan.tsx            # CREATE: camera barcode scanner screen
  _layout.tsx         # MODIFY: register `scan` route
app/(tabs)/
  add.tsx             # MODIFY: "Scan barcode" button → /scan
app.json              # MODIFY: add expo-camera plugin (permission string)
assets/data/
  off-product-sample.json  # CREATE: OFF response fixture for the mapper test
__tests__/
  openfoodfacts.test.ts    # CREATE
```

---

## Task 1: Open Food Facts client + mapper (TDD)

**Files:**
- Create: `assets/data/off-product-sample.json`, `lib/openfoodfacts.ts`
- Test: `__tests__/openfoodfacts.test.ts`
- Check: `lib/types.ts` (`Food.source` must already permit `'openfoodfacts'` — it does from Plan 1; no edit expected)

**Interfaces:**
- Produces:
  - `OffProduct` type (the fields used).
  - `offProductToFood(code: string, p: OffProduct): Food` — pure mapper (TDD).
  - `lookupBarcode(barcode: string): Promise<Food | null>` — network; returns null on not-found/error (never throws).

- [ ] **Step 1: Create the fixture**

Create `assets/data/off-product-sample.json`:
```json
{
  "code": "3017620422003",
  "status": 1,
  "product": {
    "product_name": "Nutella",
    "brands": "Ferrero",
    "serving_size": "15 g",
    "nutriments": {
      "energy-kcal_100g": 539,
      "proteins_100g": 6.3,
      "carbohydrates_100g": 57.5,
      "fat_100g": 30.9,
      "fiber_100g": 0,
      "sugars_100g": 56.3,
      "sodium_100g": 0.0428,
      "saturated-fat_100g": 10.6
    }
  }
}
```

- [ ] **Step 2: Write the failing tests**

Create `__tests__/openfoodfacts.test.ts`:
```ts
import { offProductToFood, lookupBarcode, OffProduct } from '../lib/openfoodfacts';
import sample from '../assets/data/off-product-sample.json';

describe('offProductToFood', () => {
  it('maps OFF nutriments (per 100g) into a Food, sodium g->mg', () => {
    const f = offProductToFood(sample.code, sample.product as OffProduct);
    expect(f.id).toBe('off_3017620422003');
    expect(f.source).toBe('openfoodfacts');
    expect(f.barcode).toBe('3017620422003');
    expect(f.name).toBe('Nutella');
    expect(f.brand).toBe('Ferrero');
    expect(f.per100g.kcal).toBe(539);
    expect(f.per100g.protein).toBe(6.3);
    expect(f.per100g.sodium).toBe(43); // 0.0428 g * 1000 = 42.8 -> 43 mg
    expect(f.per100g.satFat).toBe(10.6);
    // serving "15 g" parsed + 100 g
    expect(f.servingOptions).toEqual([
      { label: '15 g', grams: 15 },
      { label: '100 g', grams: 100 },
    ]);
  });

  it('defaults missing nutriments to 0 and falls back serving to just 100 g', () => {
    const f = offProductToFood('123', { product_name: 'Bare', brands: null, serving_size: null, nutriments: {} } as OffProduct);
    expect(f.name).toBe('Bare');
    expect(f.brand).toBeNull();
    expect(f.per100g.kcal).toBe(0);
    expect(f.per100g.fiber).toBe(0);
    expect(f.servingOptions).toEqual([{ label: '100 g', grams: 100 }]);
  });
});

describe('lookupBarcode', () => {
  afterEach(() => { jest.restoreAllMocks(); });

  it('returns a Food when the product exists', async () => {
    (globalThis as any).fetch = jest.fn(async () => ({
      ok: true, status: 200, json: async () => sample,
    }));
    const f = await lookupBarcode('3017620422003');
    expect(f?.name).toBe('Nutella');
  });

  it('returns null when product is missing', async () => {
    (globalThis as any).fetch = jest.fn(async () => ({
      ok: true, status: 200, json: async () => ({ status: 0, status_verbose: 'product not found' }),
    }));
    expect(await lookupBarcode('000')).toBeNull();
  });

  it('returns null on network error', async () => {
    (globalThis as any).fetch = jest.fn(async () => { throw new Error('offline'); });
    expect(await lookupBarcode('x')).toBeNull();
  });
});
```

- [ ] **Step 3: Run to confirm failure**

Run: `npm test -- openfoodfacts`
Expected: FAIL ("Cannot find module '../lib/openfoodfacts'").

- [ ] **Step 4: Implement `lib/openfoodfacts.ts`**

```ts
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
```

- [ ] **Step 5: Run tests**

Run: `npm test -- openfoodfacts`
Expected: PASS (mapper + lookup branches).

- [ ] **Step 6: Commit**

```bash
git add lib/openfoodfacts.ts assets/data/off-product-sample.json __tests__/openfoodfacts.test.ts
git commit -m "feat: add Open Food Facts barcode lookup + mapper (TDD)"
```

---

## Task 2: expo-camera install + Scanner screen + Add button

**Files:**
- Modify: `app.json` (expo-camera plugin)
- Create: `app/scan.tsx`
- Modify: `app/_layout.tsx` (register `scan` route)
- Modify: `app/(tabs)/add.tsx` ("Scan barcode" button)

**Interfaces:**
- Produces: a `/scan` screen that requests camera permission, scans EAN/UPC barcodes, resolves via `lookupBarcode`, caches via `upsertFood`, and routes to `/log/<id>`; on not-found offers "scan again" or "add custom food". Add tab gets a "Scan barcode" button.

- [ ] **Step 1: Install expo-camera + register the plugin**

Run: `npx expo install expo-camera` (retry the underlying install with `--legacy-peer-deps` if npm complains about peer deps).
In `app.json`, add to the `plugins` array:
```json
[
  "expo-camera",
  { "cameraPermission": "Allow Nutrition to scan barcodes." }
]
```

- [ ] **Step 2: Scanner screen**

Create `app/scan.tsx`:
```tsx
import { useRef, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { lookupBarcode } from '../lib/openfoodfacts';
import { upsertFood } from '../db/queries';
import { Button } from '../components/ui/Button';
import { colors, spacing, type } from '../theme';

export default function Scan() {
  const [permission, requestPermission] = useCameraPermissions();
  const handled = useRef(false);
  const [busy, setBusy] = useState(false);

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: colors.canvas }} />;
  }
  if (!permission.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.canvas, padding: spacing.gutter, gap: spacing.base, justifyContent: 'center' }}>
        <Text style={{ color: colors.text, fontFamily: type.familyBold, fontSize: type.heading }}>Camera access</Text>
        <Text style={{ color: colors.textSecondary, fontFamily: type.family, fontSize: type.bodySm }}>
          Nutrition needs the camera to scan barcodes.
        </Text>
        <Button onPress={requestPermission}>Grant camera access</Button>
        <Button variant="secondary" onPress={() => router.back()}>Cancel</Button>
      </View>
    );
  }

  const onScan = async ({ data }: { data: string }) => {
    if (handled.current) return;
    handled.current = true;
    setBusy(true);
    const food = await lookupBarcode(data);
    setBusy(false);
    if (food) {
      await upsertFood(food);
      router.replace(`/log/${food.id}`);
    } else {
      Alert.alert('Not found', `No product found for ${data}.`, [
        { text: 'Scan again', onPress: () => { handled.current = false; } },
        { text: 'Add custom food', onPress: () => router.replace('/food/new') },
      ]);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
        onBarcodeScanned={handled.current ? undefined : onScan}
      />
      <View style={{ position: 'absolute', bottom: 48, left: 0, right: 0, alignItems: 'center', gap: spacing.md }}>
        <Text style={{ color: '#fff', fontFamily: type.familyMedium, fontSize: type.bodySm }}>
          {busy ? 'Looking up…' : 'Point at a barcode'}
        </Text>
        <View style={{ width: 200 }}>
          <Button variant="secondary" onPress={() => router.back()}>Cancel</Button>
        </View>
      </View>
    </View>
  );
}
```
(If the installed `expo-camera` version's barcode type strings differ — e.g. `upc_a` vs `upca` — adjust to the installed version's accepted values and note it.)

- [ ] **Step 3: Register the route**

In `app/_layout.tsx`, add inside the `<Stack>` (keep existing screens):
```tsx
<Stack.Screen name="scan" options={{ presentation: 'modal' }} />
```

- [ ] **Step 4: Add-tab "Scan barcode" button**

In `app/(tabs)/add.tsx`, add a Scan button near the top (under the search Field, before/above the results/sections). Import `Button` and `router` (router already imported). Insert:
```tsx
<Button variant="secondary" icon={<Feather name="maximize" size={16} color={colors.text} />} onPress={() => router.push('/scan')}>
  Scan barcode
</Button>
```
(Import `Feather` from `@expo/vector-icons` if not already imported in add.tsx.)

- [ ] **Step 5: Verify (headless — camera itself can't run here)**

Run: `npx tsc --noEmit` clean; `npm test` green; `npx expo export --platform ios` bundles (confirms the expo-camera JS resolves; native validation happens at the device build in Task 3).
Do NOT run `npx expo start`.

- [ ] **Step 6: Commit**

```bash
git add app.json app/scan.tsx app/_layout.tsx "app/(tabs)/add.tsx" package.json package-lock.json
git commit -m "feat: barcode scanner screen (expo-camera) + Add-tab scan button"
```

---

## Task 3: Prebuild, build to device, final review, tag

**Files:** none (deploy + verification)

- [ ] **Step 1: Suite + types**

Run: `npm test` (expect all green incl. openfoodfacts) and `npx tsc --noEmit` (clean).

- [ ] **Step 2: Re-prebuild (new native dep) + build + install**

`expo-camera` added native code, so regenerate the native project, then build Release + install:
```bash
cd /Users/argynbyek/Desktop/VibeCoding/Nutrition
npx expo prebuild -p ios --clean
cd ios
xcodebuild -workspace Nutrition.xcworkspace -scheme Nutrition -configuration Release \
  -destination 'id=00008101-0006695A3E04001E' -derivedDataPath build -allowProvisioningUpdates \
  DEVELOPMENT_TEAM=549PHBVV44 CODE_SIGN_STYLE=Automatic build \
  && xcrun devicectl device install app --device 00008101-0006695A3E04001E \
     "$(pwd)/build/Build/Products/Release-iphoneos/Nutrition.app"
```
Expected: BUILD SUCCEEDED + install exit 0. (The Info.plist now carries `NSCameraUsageDescription` from the plugin.)

- [ ] **Step 3: Manual on-device smoke (human)**

Confirm: tap Add → Scan barcode → grant camera → scan a packaged product → it resolves to the product and opens the portion picker → logging works; an unknown barcode offers "scan again / add custom food".

- [ ] **Step 4: Tag**

```bash
cd /Users/argynbyek/Desktop/VibeCoding/Nutrition && git tag v0.4 && echo tagged
```

---

## Self-Review (against spec + prior plans)

- **Barcode scanner (camera)** → Task 2 (expo-camera CameraView + permission + EAN/UPC). ✓
- **Open Food Facts lookup + correction fallback** → Tasks 1, 2 (lookupBarcode; not-found → add custom). ✓
- **Cache to foods (loggable/offline)** → Task 2 (upsertFood) → reuses `/log/<id>` portion flow. ✓
- **OFF mapping per-100g, sodium g→mg, missing→0** → Task 1 (TDD). ✓
- **New native dep handled** → Task 3 re-prebuild before build. ✓

**Placeholder scan:** none. **Type consistency:** `OffProduct`, `Food`, `Nutrients`, query/route names match across tasks; `lookupBarcode` returns `Food | null` consumed by the scanner. **Risk to watch during impl:** the installed `expo-camera` barcode-type string values and the `CameraView`/`useCameraPermissions` API surface — verify against the actually-installed version and adjust if needed (report any deviation).
