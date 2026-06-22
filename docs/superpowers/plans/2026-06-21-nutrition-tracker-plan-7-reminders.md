# Nutrition Tracker — Plan 7: Meal Reminders

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configurable daily local notifications to remind the user to log meals — either one reminder per day or one each for breakfast/lunch/dinner — with editable times via a native time picker, all on-device.

**Architecture:** Builds on Plans 1–6. Pure reminder logic (`lib/reminders.ts`: config type, time parse/format, the list of scheduled reminders for a mode) is TDD'd. Scheduling uses `expo-notifications` daily repeating local triggers (`lib/notifications.ts`); times are chosen with `@react-native-community/datetimepicker`. Config persists in the existing `settings` table as one JSON value. On launch the app **re-syncs** the schedule only if permission is already granted (never prompts on launch). Both new modules are native → the deploy re-runs `expo prebuild`.

**Tech Stack:** Existing stack + `expo-notifications`, `@react-native-community/datetimepicker` (new native deps).

## Global Constraints

- All prior Global Constraints apply (design tokens, four meals, rounding, snapshot rule, Feather, Inter, no shadows, opacity-only feedback, TS strict).
- **Reminders are local scheduled notifications** (no push server, no network). They fire at the configured time **regardless of whether the user already logged** — smart suppression would need a background task (out of scope). User can switch off.
- **Copy:** calm, second-person, **no emoji**. Daily: title "Log your day", body "Have you logged your meals today?". Per-meal: title "Breakfast"/"Lunch"/"Dinner", body "Time to log breakfast." etc.
- **Config:** stored in `settings` under key `reminders_config` as JSON of `ReminderConfig`. Default `{ mode: 'daily', daily: '20:00', breakfast: '08:00', lunch: '13:00', dinner: '19:00' }`. Times are `"HH:MM"` 24h.
- **Permission:** never request on app launch. Request only when the user saves/enables reminders in Settings. On launch, re-sync the schedule **only if** permission is already granted.
- **New native deps** → deploy needs `expo prebuild`.
- `app.json` adds the `expo-notifications` plugin.

---

## File Structure

```
lib/
  reminders.ts        # CREATE: ReminderMode/ReminderConfig, DEFAULT_REMINDERS, parseTime, formatTime, scheduledReminders (TDD)
  notifications.ts    # CREATE: hasPermission, ensurePermission, applyReminders, syncReminders (expo-notifications)
db/
  queries.ts          # MODIFY: getReminderConfig(), setReminderConfig()
app/
  _layout.tsx         # MODIFY: notification handler + syncReminders on launch
app/(tabs)/
  settings.tsx        # MODIFY: Reminders card (mode chips + time pickers + save)
app.json              # MODIFY: expo-notifications plugin
__tests__/
  reminders.test.ts   # CREATE
```

---

## Task 1: Reminder logic (TDD) + config persistence

**Files:**
- Create: `lib/reminders.ts`
- Test: `__tests__/reminders.test.ts`
- Modify: `db/queries.ts`

**Interfaces:**
- Produces:
  - `ReminderMode = 'off' | 'daily' | 'meals'`; `ReminderConfig { mode; daily; breakfast; lunch; dinner }` (times `"HH:MM"`).
  - `DEFAULT_REMINDERS`.
  - `parseTime(s): {hour, minute}` (validates; fallback `{20,0}`).
  - `formatTime({hour,minute}): string` (zero-padded `"HH:MM"`).
  - `ScheduledReminder { key; hour; minute; title; body }`.
  - `scheduledReminders(config): ScheduledReminder[]` (`off`→[], `daily`→1, `meals`→3).
  - `getReminderConfig(): Promise<ReminderConfig>`, `setReminderConfig(c): Promise<void>`.

- [ ] **Step 1: Write the failing tests**

Create `__tests__/reminders.test.ts`:
```ts
import { parseTime, formatTime, scheduledReminders, DEFAULT_REMINDERS, ReminderConfig } from '../lib/reminders';

describe('parseTime / formatTime', () => {
  it('parses HH:MM', () => expect(parseTime('08:05')).toEqual({ hour: 8, minute: 5 }));
  it('clamps out-of-range', () => expect(parseTime('25:99')).toEqual({ hour: 23, minute: 59 }));
  it('falls back on garbage', () => expect(parseTime('nope')).toEqual({ hour: 20, minute: 0 }));
  it('formats zero-padded', () => expect(formatTime({ hour: 8, minute: 5 })).toBe('08:05'));
});

describe('scheduledReminders', () => {
  const base: ReminderConfig = { ...DEFAULT_REMINDERS };
  it('off -> none', () => expect(scheduledReminders({ ...base, mode: 'off' })).toEqual([]));
  it('daily -> one at the daily time', () => {
    const r = scheduledReminders({ ...base, mode: 'daily', daily: '20:00' });
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ key: 'daily', hour: 20, minute: 0 });
    expect(r[0].body.length).toBeGreaterThan(0);
  });
  it('meals -> three with correct hours and titles', () => {
    const r = scheduledReminders({ ...base, mode: 'meals', breakfast: '08:00', lunch: '13:00', dinner: '19:00' });
    expect(r.map(x => x.key)).toEqual(['breakfast', 'lunch', 'dinner']);
    expect(r.map(x => x.hour)).toEqual([8, 13, 19]);
    expect(r[0].title).toBe('Breakfast');
    expect(r[2].body).toBe('Time to log dinner.');
  });
});
```

- [ ] **Step 2: Run to confirm failure**

Run: `npm test -- reminders`
Expected: FAIL ("Cannot find module '../lib/reminders'").

- [ ] **Step 3: Implement `lib/reminders.ts`**

```ts
export type ReminderMode = 'off' | 'daily' | 'meals';

export interface ReminderConfig {
  mode: ReminderMode;
  daily: string;      // "HH:MM"
  breakfast: string;
  lunch: string;
  dinner: string;
}

export const DEFAULT_REMINDERS: ReminderConfig = {
  mode: 'daily', daily: '20:00', breakfast: '08:00', lunch: '13:00', dinner: '19:00',
};

export interface ScheduledReminder {
  key: string; hour: number; minute: number; title: string; body: string;
}

export function parseTime(s: string): { hour: number; minute: number } {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s ?? '');
  if (!m) return { hour: 20, minute: 0 };
  return {
    hour: Math.min(23, Math.max(0, Number(m[1]))),
    minute: Math.min(59, Math.max(0, Number(m[2]))),
  };
}

export function formatTime(t: { hour: number; minute: number }): string {
  return `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`;
}

export function scheduledReminders(c: ReminderConfig): ScheduledReminder[] {
  if (c.mode === 'off') return [];
  if (c.mode === 'daily') {
    const { hour, minute } = parseTime(c.daily);
    return [{ key: 'daily', hour, minute, title: 'Log your day', body: 'Have you logged your meals today?' }];
  }
  const meals: { key: string; time: string; label: string }[] = [
    { key: 'breakfast', time: c.breakfast, label: 'breakfast' },
    { key: 'lunch', time: c.lunch, label: 'lunch' },
    { key: 'dinner', time: c.dinner, label: 'dinner' },
  ];
  return meals.map(({ key, time, label }) => {
    const { hour, minute } = parseTime(time);
    return { key, hour, minute, title: label.charAt(0).toUpperCase() + label.slice(1), body: `Time to log ${label}.` };
  });
}
```

- [ ] **Step 4: Run tests**

Run: `npm test -- reminders`
Expected: PASS.

- [ ] **Step 5: Add config persistence to `db/queries.ts`**

Add `import { ReminderConfig, DEFAULT_REMINDERS } from '../lib/reminders';` and append:
```ts
export async function getReminderConfig(): Promise<ReminderConfig> {
  const raw = await getSetting('reminders_config');
  if (!raw) return DEFAULT_REMINDERS;
  try {
    return { ...DEFAULT_REMINDERS, ...(JSON.parse(raw) as Partial<ReminderConfig>) };
  } catch {
    return DEFAULT_REMINDERS;
  }
}

export async function setReminderConfig(config: ReminderConfig): Promise<void> {
  await setSetting('reminders_config', JSON.stringify(config));
}
```

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit` clean; `npm test` green.

- [ ] **Step 7: Commit**

```bash
git add lib/reminders.ts __tests__/reminders.test.ts db/queries.ts
git commit -m "feat: add reminder config + schedule logic (TDD)"
```

---

## Task 2: Notifications module + native install + launch sync

**Files:**
- Modify: `app.json` (expo-notifications plugin)
- Create: `lib/notifications.ts`
- Modify: `app/_layout.tsx`
- Install: `expo-notifications`, `@react-native-community/datetimepicker`

**Interfaces:**
- Consumes: `expo-notifications`, `scheduledReminders`/`ReminderConfig` (lib/reminders), `getReminderConfig` (db/queries).
- Produces:
  - `hasPermission(): Promise<boolean>` (read-only check).
  - `ensurePermission(): Promise<boolean>` (request if needed).
  - `applyReminders(config): Promise<{ granted: boolean }>` (cancel all; if off → done; else ensure permission then schedule daily repeating).
  - `syncReminders(config): Promise<void>` (launch-time: off → cancel; else reschedule ONLY if already permitted — never prompts).

- [ ] **Step 1: Install native modules + plugin**

Run: `npx expo install expo-notifications @react-native-community/datetimepicker` (retry underlying install with `--legacy-peer-deps` if peer-dep errors).
In `app.json`, add to `plugins`: `"expo-notifications"`.

- [ ] **Step 2: Implement `lib/notifications.ts`**

```ts
import * as Notifications from 'expo-notifications';
import { ReminderConfig, scheduledReminders } from './reminders';

export async function hasPermission(): Promise<boolean> {
  const p = await Notifications.getPermissionsAsync();
  return p.granted;
}

export async function ensurePermission(): Promise<boolean> {
  if (await hasPermission()) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

async function schedule(config: ReminderConfig): Promise<void> {
  for (const r of scheduledReminders(config)) {
    await Notifications.scheduleNotificationAsync({
      content: { title: r.title, body: r.body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: r.hour,
        minute: r.minute,
      },
    });
  }
}

export async function applyReminders(config: ReminderConfig): Promise<{ granted: boolean }> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (config.mode === 'off') return { granted: true };
  const granted = await ensurePermission();
  if (!granted) return { granted: false };
  await schedule(config);
  return { granted: true };
}

// Launch-time resync — never prompts; only reschedules if already permitted.
export async function syncReminders(config: ReminderConfig): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (config.mode === 'off') return;
  if (!(await hasPermission())) return;
  await schedule(config);
}
```
**Verify the installed `expo-notifications` API:** confirm `SchedulableTriggerInputTypes.DAILY` exists; if the installed version uses a different daily-trigger shape, use it (e.g. `{ hour, minute, repeats: true }`) and note it. Confirm `getPermissionsAsync`/`requestPermissionsAsync` return an object with `.granted`.

- [ ] **Step 3: Wire the handler + launch sync into `app/_layout.tsx`**

Read the current `app/_layout.tsx`. Add at module top (outside the component):
```tsx
import * as Notifications from 'expo-notifications';
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false,
  }),
});
```
(If the installed version's handler return type uses `shouldShowAlert` instead of `shouldShowBanner`/`shouldShowList`, use that — verify.)
In the existing DB-init effect, after `seedIfEmpty()` / before or after `setDbReady(true)`, fire-and-forget a resync (do NOT block render, do NOT prompt):
```tsx
import { getReminderConfig } from '../db/queries';
import { syncReminders } from '../lib/notifications';
// inside the async init, after the DB is ready:
getReminderConfig().then(syncReminders).catch(() => {});
```

- [ ] **Step 4: Verify (headless)**

Run: `npx tsc --noEmit` clean; `npm test` green; `npx expo export --platform ios` bundles (confirms the modules' JS resolves; native validation is the device build in Task 4).
Do NOT run `npx expo start`. Do NOT prebuild/native-build here (Task 4).

- [ ] **Step 5: Commit**

```bash
git add app.json lib/notifications.ts app/_layout.tsx package.json package-lock.json
git commit -m "feat: notifications module + launch resync (expo-notifications)"
```

---

## Task 3: Settings — Reminders card

**Files:**
- Modify: `app/(tabs)/settings.tsx`

**Interfaces:**
- Consumes: `getReminderConfig`/`setReminderConfig` (db/queries), `applyReminders` (lib/notifications), `ReminderMode`/`ReminderConfig`/`parseTime`/`formatTime` (lib/reminders), `DateTimePicker`, Card/Button/SectionLabel, theme.
- Produces: a Reminders card — mode chips (Off / Once a day / Per meal), time rows that open the native time picker, and a Save button that persists config + applies the schedule (requesting permission), with feedback if permission is denied.

- [ ] **Step 1: Add the Reminders card**

Read the current `app/(tabs)/settings.tsx`. Add imports:
```tsx
import DateTimePicker from '@react-native-community/datetimepicker';
import { getReminderConfig, setReminderConfig } from '../../db/queries';
import { applyReminders } from '../../lib/notifications';
import { ReminderConfig, ReminderMode, DEFAULT_REMINDERS, parseTime, formatTime } from '../../lib/reminders';
import { Pressable } from 'react-native'; // merge into existing react-native import
```
State + load + helpers (place with the other hooks):
```tsx
const [reminders, setReminders] = useState<ReminderConfig>(DEFAULT_REMINDERS);
const [picking, setPicking] = useState<null | keyof ReminderConfig>(null);
const [remSaved, setRemSaved] = useState(false);
useEffect(() => { getReminderConfig().then(setReminders); }, []);

const timeToDate = (hhmm: string) => { const { hour, minute } = parseTime(hhmm); const d = new Date(); d.setHours(hour, minute, 0, 0); return d; };
const onPickTime = (field: keyof ReminderConfig, date?: Date) => {
  setPicking(null);
  if (date) setReminders(prev => ({ ...prev, [field]: formatTime({ hour: date.getHours(), minute: date.getMinutes() }) }));
};
const saveReminders = async () => {
  await setReminderConfig(reminders);
  const { granted } = await applyReminders(reminders);
  if (!granted && reminders.mode !== 'off') {
    Alert.alert('Notifications off', 'Enable notifications for Nutrition in iOS Settings to get reminders.');
    return;
  }
  setRemSaved(true);
  setTimeout(() => setRemSaved(false), 1500);
};
```
Render the card (below the existing cards, same ScrollView). A small time-row helper inside the JSX:
```tsx
const modeChip = (m: ReminderMode, label: string) => (
  <Pressable key={m} onPress={() => setReminders(prev => ({ ...prev, mode: m }))} style={{
    flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radii.control,
    borderWidth: 1, borderColor: reminders.mode === m ? colors.amber : colors.border, backgroundColor: colors.secondary,
  }}>
    <Text style={{ color: reminders.mode === m ? colors.amber : colors.text, fontFamily: type.familyMedium, fontSize: type.bodySm }}>{label}</Text>
  </Pressable>
);
const timeRow = (field: keyof ReminderConfig, label: string) => (
  <Pressable onPress={() => setPicking(field)} style={{
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border, borderRadius: radii.row, padding: spacing.md,
  }}>
    <Text style={{ color: colors.text, fontFamily: type.family, fontSize: type.bodySm }}>{label}</Text>
    <Text style={{ color: colors.amber, fontFamily: type.familySemibold, fontSize: type.body }}>{reminders[field] as string}</Text>
  </Pressable>
);
```
The card:
```tsx
<Card style={{ gap: spacing.md }}>
  <SectionLabel>Reminders</SectionLabel>
  <Text style={{ color: colors.textMuted, fontFamily: type.family, fontSize: type.caption }}>
    Daily reminders to log your meals. They notify at the set time whether or not you've logged.
  </Text>
  <View style={{ flexDirection: 'row', gap: spacing.sm }}>
    {modeChip('off', 'Off')}
    {modeChip('daily', 'Once a day')}
    {modeChip('meals', 'Per meal')}
  </View>
  {reminders.mode === 'daily' && timeRow('daily', 'Reminder time')}
  {reminders.mode === 'meals' && (
    <View style={{ gap: spacing.sm }}>
      {timeRow('breakfast', 'Breakfast')}
      {timeRow('lunch', 'Lunch')}
      {timeRow('dinner', 'Dinner')}
    </View>
  )}
  {picking && (
    <DateTimePicker
      value={timeToDate(reminders[picking] as string)}
      mode="time"
      onChange={(_e, date) => onPickTime(picking, date)}
    />
  )}
  <Button variant="secondary" onPress={saveReminders}>{remSaved ? 'Saved ✓' : 'Save reminders'}</Button>
</Card>
```
Keep all existing cards intact. Ensure `radii` is imported (it's used by chips/rows).

**Verify the installed `@react-native-community/datetimepicker` API:** `mode="time"`, `value: Date`, `onChange: (event, date?: Date) => void`. On Android the picker auto-dismisses; on iOS `display` defaults to inline/compact — acceptable. Adjust prop names if the installed version differs and note it.

- [ ] **Step 2: Verify (headless)**

Run: `npx tsc --noEmit` clean; `npm test` green; `npx expo export --platform ios` bundles.
Do NOT run `npx expo start`.

- [ ] **Step 3: Commit**

```bash
git add "app/(tabs)/settings.tsx"
git commit -m "feat: Reminders card in settings (mode + native time picker)"
```

---

## Task 4: Prebuild, build to device, final review, tag

**Files:** none (deploy + verification)

- [ ] **Step 1: Suite + types**

Run: `npm test` (expect all green incl. reminders) and `npx tsc --noEmit` (clean).

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

Confirm: Settings → Reminders → pick a time a minute ahead → Save → grant the notification permission prompt → the notification fires at that time (lock the phone to see it). Switch to Per meal, set three times, Save. Switch Off → Save → no more reminders. Killing/reopening the app keeps the schedule.

- [ ] **Step 4: Tag**

```bash
cd /Users/argynbyek/Desktop/VibeCoding/Nutrition && git tag v0.7 && echo tagged
```

---

## Self-Review (against the design)

- **Configurable: 1/day or per-meal (3)** → Tasks 1, 3 (mode `daily`/`meals`). ✓
- **Editable times via native picker** → Task 3 (DateTimePicker). ✓
- **Daily repeating local notifications** → Task 2 (`scheduleNotificationAsync` daily trigger). ✓
- **Default once-a-day @ 20:00; permission only on enable; launch resync without prompt** → Tasks 1 (default), 2 (`applyReminders` requests, `syncReminders` doesn't). ✓
- **Calm no-emoji copy** → Task 1 (`scheduledReminders`). ✓
- **New native deps handled** → Task 4 re-prebuild + app.json plugin. ✓

**Placeholder scan:** none. **Type consistency:** `ReminderConfig`/`ReminderMode`/`ScheduledReminder`, `getReminderConfig`/`setReminderConfig`/`applyReminders`/`syncReminders`/`scheduledReminders` consistent across lib/db/settings/_layout. **Risks to watch during impl (verify against installed versions, adjust + report):** (1) `expo-notifications` daily-trigger shape (`SchedulableTriggerInputTypes.DAILY` vs `{hour,minute,repeats:true}`) and the notification-handler keys (`shouldShowBanner`/`shouldShowList` vs `shouldShowAlert`); (2) `@react-native-community/datetimepicker` prop/callback shape and iOS display mode.
