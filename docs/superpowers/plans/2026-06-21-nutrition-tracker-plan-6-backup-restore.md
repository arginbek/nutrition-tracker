# Nutrition Tracker — Plan 6: Backup & Restore

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Export all app data to a single shareable `.json` file (Files/iCloud Drive/AirDrop/email) and restore from one by **merging** it back in — idempotent on re-import, with API keys excluded from the file.

**Architecture:** Builds on Plans 1–5. A pure backup envelope (`buildBackup`/`parseBackup`/`countRows`) is TDD'd. DB dump/merge are explicit per-table query helpers (`dumpTables`/`loadTables`) — merge is `INSERT OR REPLACE` by primary key (so re-importing the same backup is a no-op), favorites dedupe by `(ref_type, ref_id)`, and the `settings` dump **excludes the API keys**. The Settings screen gains a Backup & Restore card using `expo-sharing` (export) + `expo-document-picker` (import) + `expo-file-system` (read/write the file). **These are new native modules**, so the deploy re-runs `expo prebuild`.

**Tech Stack:** Existing stack + `expo-sharing`, `expo-document-picker`, `expo-file-system` (new native deps).

## Global Constraints

- All prior Global Constraints apply (design tokens, four meals, rounding, snapshot rule, Feather, Inter, no shadows, opacity-only feedback, TS strict).
- **Backup envelope:** `{ app: "nutrition-tracker", version: 1, exportedAt: <ISO>, data: { <table>: rows[] } }`. `parseBackup` rejects anything whose `app` !== `"nutrition-tracker"` or whose `data` isn't an object → returns null (no crash, no partial import).
- **Tables backed up:** `foods`, `log_entries`, `recipes`, `recipe_components`, `weight_entries`, `targets`, `favorites`, `settings`. Rows are exported as raw DB column objects (JSON-string columns like `per100g`/`computed`/`serving_options` stay as stored strings).
- **`settings` export EXCLUDES** `anthropic_api_key` and `usda_api_key` (secrets stay on-device).
- **Merge semantics:** `INSERT OR REPLACE` by primary key for `foods`/`log_entries`/`recipes`/`recipe_components`/`weight_entries`/`targets`/`settings`; `favorites` insert only when `(ref_type, ref_id)` not already present. Re-importing the same backup must change nothing (idempotent).
- **Import is atomic** (wrapped in a transaction) and only runs after `parseBackup` succeeds + user confirms.
- **New native deps** → deploy needs `expo prebuild` before the device build.

---

## File Structure

```
lib/
  backup.ts          # CREATE: BACKUP_APP/VERSION, BackupTables type, buildBackup, parseBackup, countRows (TDD)
db/
  queries.ts         # MODIFY: dumpTables(), loadTables(data)
app/(tabs)/
  settings.tsx       # MODIFY: Backup & Restore card (export + restore)
__tests__/
  backup.test.ts     # CREATE
```

---

## Task 1: Backup envelope (TDD) + DB dump/load

**Files:**
- Create: `lib/backup.ts`
- Test: `__tests__/backup.test.ts`
- Modify: `db/queries.ts`

**Interfaces:**
- Produces:
  - `BACKUP_APP = 'nutrition-tracker'`, `BACKUP_VERSION = 1`.
  - `BackupRow = Record<string, string | number | null>`; `BackupTables` (one array per table); `Backup { app; version; exportedAt; data: BackupTables }`.
  - `buildBackup(data: BackupTables, exportedAt: string): string`.
  - `parseBackup(text: string): Backup | null`.
  - `countRows(data: BackupTables): number`.
  - `dumpTables(): Promise<BackupTables>` (DB read; settings minus API keys).
  - `loadTables(data: BackupTables): Promise<number>` (atomic merge; returns rows imported).

- [ ] **Step 1: Write the failing tests**

Create `__tests__/backup.test.ts`:
```ts
import { buildBackup, parseBackup, countRows, BACKUP_APP, BackupTables } from '../lib/backup';

const empty: BackupTables = {
  foods: [], log_entries: [], recipes: [], recipe_components: [],
  weight_entries: [], targets: [], favorites: [], settings: [],
};

describe('buildBackup / parseBackup', () => {
  it('round-trips data with the app marker', () => {
    const data: BackupTables = { ...empty, log_entries: [{ id: 'log_1', date: '2026-06-20' }] };
    const text = buildBackup(data, '2026-06-21T00:00:00.000Z');
    const parsed = parseBackup(text);
    expect(parsed).not.toBeNull();
    expect(parsed!.app).toBe(BACKUP_APP);
    expect(parsed!.version).toBe(1);
    expect(parsed!.exportedAt).toBe('2026-06-21T00:00:00.000Z');
    expect(parsed!.data.log_entries).toHaveLength(1);
  });
  it('rejects non-JSON', () => {
    expect(parseBackup('nope')).toBeNull();
  });
  it('rejects a foreign file (wrong app marker)', () => {
    expect(parseBackup(JSON.stringify({ app: 'something-else', data: {} }))).toBeNull();
  });
  it('rejects when data is missing/not an object', () => {
    expect(parseBackup(JSON.stringify({ app: BACKUP_APP, version: 1 }))).toBeNull();
  });
});

describe('countRows', () => {
  it('sums rows across tables', () => {
    const data: BackupTables = {
      ...empty,
      foods: [{ id: 'a' }, { id: 'b' }],
      log_entries: [{ id: 'l' }],
    };
    expect(countRows(data)).toBe(3);
  });
});
```

- [ ] **Step 2: Run to confirm failure**

Run: `npm test -- backup`
Expected: FAIL ("Cannot find module '../lib/backup'").

- [ ] **Step 3: Implement `lib/backup.ts`**

```ts
export const BACKUP_APP = 'nutrition-tracker';
export const BACKUP_VERSION = 1;

export type BackupRow = Record<string, string | number | null>;

export interface BackupTables {
  foods: BackupRow[];
  log_entries: BackupRow[];
  recipes: BackupRow[];
  recipe_components: BackupRow[];
  weight_entries: BackupRow[];
  targets: BackupRow[];
  favorites: BackupRow[];
  settings: BackupRow[];
}

export interface Backup {
  app: string;
  version: number;
  exportedAt: string;
  data: BackupTables;
}

export const BACKUP_TABLE_KEYS: (keyof BackupTables)[] = [
  'foods', 'log_entries', 'recipes', 'recipe_components',
  'weight_entries', 'targets', 'favorites', 'settings',
];

export function buildBackup(data: BackupTables, exportedAt: string): string {
  const backup: Backup = { app: BACKUP_APP, version: BACKUP_VERSION, exportedAt, data };
  return JSON.stringify(backup, null, 2);
}

export function parseBackup(text: string): Backup | null {
  try {
    const obj = JSON.parse(text) as Partial<Backup>;
    if (!obj || obj.app !== BACKUP_APP) return null;
    if (!obj.data || typeof obj.data !== 'object') return null;
    // normalize: ensure every known table key is an array
    const data = {} as BackupTables;
    for (const key of BACKUP_TABLE_KEYS) {
      const rows = (obj.data as Record<string, unknown>)[key];
      data[key] = Array.isArray(rows) ? (rows as BackupRow[]) : [];
    }
    return {
      app: BACKUP_APP,
      version: typeof obj.version === 'number' ? obj.version : 1,
      exportedAt: typeof obj.exportedAt === 'string' ? obj.exportedAt : '',
      data,
    };
  } catch {
    return null;
  }
}

export function countRows(data: BackupTables): number {
  return BACKUP_TABLE_KEYS.reduce((sum, key) => sum + data[key].length, 0);
}
```

- [ ] **Step 4: Run tests**

Run: `npm test -- backup`
Expected: PASS.

- [ ] **Step 5: Add `dumpTables` + `loadTables` to `db/queries.ts`**

Add `BackupTables, BackupRow` to the import from `../lib/backup` (create the import line), then append:
```ts
import { BackupTables, BackupRow } from '../lib/backup';

export async function dumpTables(): Promise<BackupTables> {
  const db = getDb();
  const all = async (sql: string, args: any[] = []) =>
    (await db.getAllAsync<BackupRow>(sql, args)) as BackupRow[];
  return {
    foods: await all('SELECT * FROM foods'),
    log_entries: await all('SELECT * FROM log_entries'),
    recipes: await all('SELECT * FROM recipes'),
    recipe_components: await all('SELECT * FROM recipe_components'),
    weight_entries: await all('SELECT * FROM weight_entries'),
    targets: await all('SELECT * FROM targets'),
    favorites: await all('SELECT * FROM favorites'),
    settings: await all(
      "SELECT key, value FROM settings WHERE key NOT IN ('anthropic_api_key', 'usda_api_key')",
    ),
  };
}

// Each importer uses INSERT OR REPLACE by primary key (idempotent re-import).
// Column lists are fixed (not derived from the file) to avoid SQL injection via keys.
async function importRows(
  table: string, cols: string[], rows: BackupRow[],
): Promise<number> {
  if (rows.length === 0) return 0;
  const db = getDb();
  const placeholders = cols.map(() => '?').join(', ');
  let n = 0;
  for (const row of rows) {
    await db.runAsync(
      `INSERT OR REPLACE INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`,
      cols.map(c => (row[c] ?? null) as string | number | null),
    );
    n++;
  }
  return n;
}

export async function loadTables(data: BackupTables): Promise<number> {
  const db = getDb();
  let imported = 0;
  await db.withTransactionAsync(async () => {
    imported += await importRows('foods', ['id', 'name', 'brand', 'source', 'barcode', 'per100g', 'serving_options'], data.foods);
    imported += await importRows('log_entries', ['id', 'date', 'meal', 'food_id', 'name_snapshot', 'serving_label', 'quantity', 'computed'], data.log_entries);
    imported += await importRows('recipes', ['id', 'name'], data.recipes);
    imported += await importRows('recipe_components', ['id', 'recipe_id', 'food_id', 'serving_label', 'quantity'], data.recipe_components);
    imported += await importRows('weight_entries', ['id', 'date', 'weight', 'unit'], data.weight_entries);
    imported += await importRows('targets', ['id', 'daily_kcal', 'protein_g', 'carbs_g', 'fat_g'], data.targets);
    imported += await importRows('settings', ['key', 'value'], data.settings);
    // favorites: dedupe by (ref_type, ref_id)
    for (const row of data.favorites) {
      const existing = await db.getFirstAsync<{ id: string }>(
        'SELECT id FROM favorites WHERE ref_type = ? AND ref_id = ?',
        [(row.ref_type ?? '') as string, (row.ref_id ?? '') as string],
      );
      if (!existing) {
        await db.runAsync(
          'INSERT OR REPLACE INTO favorites (id, ref_type, ref_id) VALUES (?, ?, ?)',
          [(row.id ?? `fav_${row.ref_type}_${row.ref_id}`) as string, (row.ref_type ?? '') as string, (row.ref_id ?? '') as string],
        );
        imported++;
      }
    }
  });
  return imported;
}
```

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit` clean; `npm test` green.

- [ ] **Step 7: Commit**

```bash
git add lib/backup.ts __tests__/backup.test.ts db/queries.ts
git commit -m "feat: add backup envelope (TDD) + DB dump/merge helpers"
```

---

## Task 2: Native deps + Settings Backup & Restore card

**Files:**
- Modify: `app/(tabs)/settings.tsx`
- Install: `expo-sharing`, `expo-document-picker`, `expo-file-system`

**Interfaces:**
- Consumes: `dumpTables`, `loadTables`, `buildBackup`, `parseBackup`, `countRows`, expo-sharing/document-picker/file-system.
- Produces: a Backup & Restore card — **Export** writes the JSON to a temp file and opens the Share Sheet; **Restore** picks a `.json`, parses it, confirms the row count, merges, and reports the result.

- [ ] **Step 1: Install native modules**

Run: `npx expo install expo-sharing expo-document-picker expo-file-system` (retry the underlying install with `--legacy-peer-deps` if peer-dep errors).

- [ ] **Step 2: Add the Backup & Restore card to Settings**

In `app/(tabs)/settings.tsx`, add imports (merge `Alert` into the react-native import):
```tsx
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { dumpTables, loadTables } from '../../db/queries';
import { buildBackup, parseBackup, countRows } from '../../lib/backup';
```
For file I/O, use the installed expo-file-system API. **Verify which API the installed version exposes** and use it:
- New API (SDK 54+ default): `import { File, Paths } from 'expo-file-system';`
  - write: `const f = new File(Paths.cache, 'nutrition-backup.json'); f.write(json); const uri = f.uri;`
  - read picked: `const text = new File(pickedUri).text();`
- Legacy API: `import * as FileSystem from 'expo-file-system';` (or `'expo-file-system/legacy'` if required)
  - write: `const uri = FileSystem.cacheDirectory + 'nutrition-backup.json'; await FileSystem.writeAsStringAsync(uri, json);`
  - read picked: `const text = await FileSystem.readAsStringAsync(pickedUri);`

Add handlers + a Card (below the existing cards, same ScrollView):
```tsx
const exportBackup = async () => {
  try {
    const data = await dumpTables();
    const json = buildBackup(data, new Date().toISOString());
    // --- write `json` to a temp file `uri` using the installed expo-file-system API (see above) ---
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Sharing unavailable', 'Cannot open the share sheet on this device.');
      return;
    }
    await Sharing.shareAsync(uri, { mimeType: 'application/json', UTI: 'public.json', dialogTitle: 'Nutrition backup' });
  } catch {
    Alert.alert('Export failed', 'Could not create the backup.');
  }
};

const restoreBackup = async () => {
  try {
    const res = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
    if (res.canceled || !res.assets?.[0]?.uri) return;
    // --- read the picked file's text using the installed expo-file-system API (see above) ---
    const backup = parseBackup(text);
    if (!backup) {
      Alert.alert('Invalid file', 'That is not a Nutrition backup file.');
      return;
    }
    const n = countRows(backup.data);
    Alert.alert('Restore backup?', `Merge ${n} item${n === 1 ? '' : 's'} from this backup into your data?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Restore', onPress: async () => {
        const imported = await loadTables(backup.data);
        Alert.alert('Restored', `Merged ${imported} item${imported === 1 ? '' : 's'}.`);
      } },
    ]);
  } catch {
    Alert.alert('Restore failed', 'Could not read that backup file.');
  }
};
```
Render the card:
```tsx
<Card style={{ gap: spacing.md }}>
  <SectionLabel>Backup & Restore</SectionLabel>
  <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.caption }}>
    Export saves all your data (not your API keys) to a file you can store in Files or iCloud. Restore merges a backup back in.
  </Text>
  <Button variant="secondary" onPress={exportBackup}>Export backup</Button>
  <Button variant="secondary" onPress={restoreBackup}>Restore from backup</Button>
</Card>
```

- [ ] **Step 3: Verify (headless — share/picker can't run here)**

Run: `npx tsc --noEmit` clean; `npm test` green; `npx expo export --platform ios` bundles (confirms the new modules' JS resolves; native validation is the device build in Task 3).
Do NOT run `npx expo start`.

- [ ] **Step 4: Commit**

```bash
git add "app/(tabs)/settings.tsx" package.json package-lock.json
git commit -m "feat: Backup & Restore card in settings (share + document picker)"
```

---

## Task 3: Prebuild, build to device, final review, tag

**Files:** none (deploy + verification)

- [ ] **Step 1: Suite + types**

Run: `npm test` (expect all green incl. backup) and `npx tsc --noEmit` (clean).

- [ ] **Step 2: Re-prebuild (new native deps) + build + install**

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
Expected: BUILD SUCCEEDED + install exit 0.

- [ ] **Step 3: Manual on-device smoke (human)**

Confirm: Settings → Export backup → share sheet appears, save to Files. Restore from backup → pick the file → confirm count → "Restored". Re-importing the same file changes nothing (idempotent). A non-backup file is rejected.

- [ ] **Step 4: Tag**

```bash
cd /Users/argynbyek/Desktop/VibeCoding/Nutrition && git tag v0.6 && echo tagged
```

---

## Self-Review (against the design)

- **Export all data to a shareable file** → Tasks 1, 2 (dumpTables + buildBackup + Sharing). ✓
- **Restore by merge, idempotent** → Task 1 (`loadTables` INSERT OR REPLACE by id; favorites dedupe). ✓
- **API keys excluded** → Task 1 (`dumpTables` settings WHERE key NOT IN keys). ✓
- **Reject foreign/corrupt files** → Task 1 (`parseBackup` app-marker + data guards), Task 2 (Alert on null). ✓
- **Atomic import** → Task 1 (`withTransactionAsync`). ✓
- **Native deps handled** → Task 3 re-prebuild. ✓

**Placeholder scan:** the Task-2 file-I/O lines are intentionally marked for the implementer to fill with the installed `expo-file-system` API (new `File`/`Paths` vs legacy) — the implementer must verify and implement both the write (export) and read (restore) using whichever the installed version provides, then confirm tsc passes. **Type consistency:** `BackupTables`/`BackupRow`/`Backup` consistent across lib + db + settings; `dumpTables`/`loadTables`/`buildBackup`/`parseBackup`/`countRows` signatures match call sites. **Risk to watch:** the `expo-file-system` API version (new vs legacy) and `DocumentPicker.getDocumentAsync` result shape (`canceled` / `assets[].uri`) — verify against installed versions.
