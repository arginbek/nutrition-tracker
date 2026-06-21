# Mindful Unlock — Design System

A design system distilled from the **Mindful Unlock** iOS app: a calm, dark,
intention-before-access "app blocker." Instead of hard-walling apps, it puts a
short *ritual* between you and a distracting app — write your intention, and the
further you escalate, the more it asks of you (a reflection, an oath, a timed
wait). The whole product feels like a quiet, warm room in the dark.

Use this system to design **new iOS apps in the same family** — focus, habit,
journaling, and mindfulness tools that share this restrained, ritual-driven voice.

## Source material
This system was reverse-engineered from a real codebase. If you have access, read
it to go deeper:

- **GitHub:** [`arginbek/Focus-Blocker`](https://github.com/arginbek/Focus-Blocker)
  (private). The app lives in `artifacts/mobile` — an Expo / React Native project.
  - `constants/colors.ts` — the exact dark-amber palette (lifted verbatim into `tokens/colors.css`).
  - `app/(tabs)/index.tsx`, `journal.tsx`, `stats.tsx` — the three main screens.
  - `app/unlock/[appId].tsx` — the multi-step unlock ritual (the heart of the app).
  - `app/unlock/native.tsx` + `ios-native/FamilyPickerView.swift` — the app picker
    and the native iOS Screen Time sheet.

> **Explore the repo** to build with higher fidelity — the unlock state machine and
> escalation logic in particular reward a close read.

### A note on the "hybrid native" look
The owner flagged that the **native iOS window rendered inside React Native**
(Apple's stock Family Activity / Screen Time picker) looks jarring and off-brand.
This system addresses that with a redesigned, on-brand **`BlockSheet`** — a frosted,
branded bottom sheet — plus a translucent blurred `TabBar` and a real iOS status bar,
so the native chrome reads as a deliberate part of the app instead of a bolted-on
system surface. See the Mindful Unlock UI kit.

---

## Content fundamentals

The voice is **calm, second-person, and quietly firm** — a supportive friend who
won't let you off the hook, never a scold.

- **Person & address.** Always "you" / "your." The app speaks *to* the user about
  *their* intentions ("What's your intention?", "Why can't this wait? Be honest with
  yourself."). It rarely says "we."
- **Tone.** Reflective and grounding. Short declaratives. It asks questions more than
  it commands. Praise for restraint is warm but understated: *"Good call."*,
  *"This kind of restraint is what this app is about."*
- **Escalation in language.** Copy hardens as you return to an app the same day:
  Visit 1 is gentle ("What are you planning to do in Instagram?"); Visit 3+ turns
  ceremonial ("Write a **solemn oath**", "State clearly and honestly why this cannot
  wait. This is a commitment.", "**Honour** your oath"). Lean into ritual words —
  *intention, oath, vow, commitment, reflect, sit with*.
- **Casing.** Sentence case for titles and body. **UPPERCASE** only for small
  letter-spaced section eyebrows ("TRACKED APPS", "RECENT SESSIONS") and short level
  labels ("L1", "VISIT 3").
- **Spelling.** British-leaning in ceremonial moments — note **"Honour your oath"**.
  Keep it consistent in ritual copy.
- **Numbers & units.** Compact and human: "10 minutes", "5d streak", "12m", "8:12 AM".
  Durations abbreviate (s / m / h); timers read `m:ss`.
- **No emoji.** The product uses none in its UI copy — don't add them. A single ✓ /
  glyph inside a countdown circle is the only symbolic flourish.
- **Buttons** are first-person commitments or plain verbs: *"I'll wait 10 minutes"*,
  *"I commit to this oath"*, *"Start Unlock Ritual"*, *"Unlock"*, *"Done"*.

Example microcopy to match the register:
> *"You've already opened Instagram once today. Do you want to come back in 10
> minutes, or do you need it right now?"*
> *"Take a break. If you still need it after 10 minutes, you can unlock it then.
> Keeps your streak alive."*

---

## Visual foundations

**Mood:** dark, warm, and minimal. A single near-black canvas, one amber accent that
glows like lamplight, purple reserved for moments of commitment. Nothing decorative —
the calm comes from generous spacing and restraint.

- **Color.** Background is near-black with a faint warmth (`#0A0A0E`); surfaces step
  up in tiny increments (`#13131A` card → `#18181F` raised). Text is a **warm
  off-white** (`#F0EDE8`), never pure white. **Amber `#F59E0B`** is *the* accent —
  primary buttons, active states, highlights. **Purple `#7C3AED`** marks oath /
  commitment. Green = shield-on / streaks / completion; red = emergency / destructive.
  See the **Escalation Scale** (green → amber → red → purple) which encodes visit /
  difficulty level 1→4 everywhere.
- **Accent-at-13%.** The signature treatment: an icon or pill sits in full brand
  color over a **~13%-opacity wash of the same color** (`color + "22"` in the native
  code; `--tint-*` here). This is how every app icon, status pill, and badge is built.
- **Typography.** One typeface — **Inter** — in four weights (400/500/600/700).
  Screen titles 26/700, ritual step titles 24/700, headings 18/600, body 14–16/400,
  captions 11–13. Section eyebrows are 13/600 uppercase with 0.8px tracking.
- **Spacing.** ~8pt rhythm with in-between steps. 16px is the default card padding and
  gap; 20px is the screen gutter. Layouts are single-column, generously spaced stacks.
- **Corners.** Soft and consistent. **16px is the signature card radius**; buttons and
  inputs 12–14px; small icon tiles 8–13px; large app-icon tiles 20px; pills and timers
  fully round.
- **Cards & separation.** Cards are flat: card background + a **1px hairline border**
  (`#1E1E2A`), **no drop shadow**. State is signaled by *tinting the border* (amber for
  prompts, green for an active shield, red for danger) rather than by elevation.
  Drop shadows appear only on truly floating chrome (the blurred tab bar, sheets).
- **Backgrounds.** Solid near-black — no images, gradients, or textures inside the app.
  The only gradients are subtle radial glows behind the device in marketing/kit framing
  and the lamplight halo in the app icon. Never put gradients on cards or buttons.
- **Transparency & blur.** Used deliberately for "hybrid native" chrome: the bottom
  **TabBar** and **BottomSheet** are translucent dark surfaces with `backdrop-filter:
  blur()`. Everything else is opaque.
- **Borders.** 1px hairline by default; 2px for emphasis (accent card borders, the
  circular wait/countdown rings).
- **Motion.** Quiet and brief. Screen entrances are a 250ms opacity fade; sheets slide
  up ~320ms on an ease-out curve (`cubic-bezier(0.22,1,0.36,1)`). No bounces, no
  infinite/looping decorative animation. Countdown rings simply tick.
- **Hover / press.** It's a touch app — feedback is **opacity**: pressed rows drop to
  ~0.6–0.7 opacity, disabled controls to 0.4. No color-shift or scale on press. Haptics
  stand in for hover on device.
- **Imagery vibe.** Warm and dark. The app mark is a softly glowing amber padlock on
  black. If you add photography, keep it low-key, warm-toned, and dim.

---

## Iconography

- **Feather Icons** is the icon system, everywhere, at a consistent ~1.5–2px stroke
  weight. In the native app these come from `@expo/vector-icons` (`Feather`); in this
  system the cards and UI kit load **`feather-icons`** from CDN and render via
  `feather.icons[name].toSvg()`. Common glyphs: `shield`, `lock`, `unlock`, `clock`,
  `book-open`, `bar-chart-2`, `trending-up`, `alert-triangle`, `check`, `check-circle`,
  `chevron-right`, `x`, `zap`, `star`, `grid`, `sliders`.
- **iOS SF Symbols** appear only in the live native tab bar (`shield`, `book`,
  `chart.bar`) when Liquid Glass tabs are available — match them to the Feather
  equivalents above when designing.
- **App / brand icons.** Third-party apps (Instagram, YouTube, …) are represented by
  their *closest Feather glyph* tinted with the brand's color (e.g. `instagram` in
  `#E1306C`) inside an `IconTile` — never real third-party logos. The brand-color map
  is in the UI kit's `frame.jsx` (mirrors `constants/availableApps.ts`).
- **No emoji, no unicode-as-icon.** The lone exception is a `✓` rendered large inside
  the reflection countdown circle.
- Draw nothing custom — pull from Feather. The only bespoke asset is the **app mark**
  (`assets/app-icon.png`), a glowing padlock.

> **Substitution flag:** Inter is loaded from **Google Fonts** (the native app ships it
> via `@expo-google-fonts/inter`) and Feather from a CDN, since no font/icon binaries
> were in the repo. Swap in self-hosted `.woff2` Inter and a local Feather sprite if you
> need fully offline assets — see `tokens/fonts.css`.

---

## Index — what's in this system

**Foundations**
- `styles.css` — the entry point consumers link (imports only).
- `tokens/colors.css` — palette + escalation scale + semantic aliases + 13% tints.
- `tokens/typography.css` — Inter scale, weights, line-heights, label tracking.
- `tokens/spacing.css` — spacing scale, radii (16px signature), borders, shadows.
- `tokens/fonts.css` — Inter via Google Fonts.
- `guidelines/*.html` — specimen cards (Colors, Type, Spacing, Brand) for the DS tab.

**Components** (`components/`, exposed on `window.MindfulUnlockDesignSystem_bf3027`)
- `buttons/` — **Button** (primary / secondary / commit / destructive / ghost).
- `display/` — **IconTile**, **Pill**, **Card**, **StatTile**, **MeterBar**,
  **ListRow**, **SectionLabel**.
- `forms/` — **Field** (ritual reflection input), **Checkbox**.
- `navigation/` — **TabBar** (frosted bottom nav).

**UI kit** (`ui_kits/mindful-unlock/`)
- A full interactive iOS recreation: Apps / Journal / Insights tabs, the unlock
  ritual, and the redesigned Screen Time `BlockSheet`. See its `README.md`.

**Assets** (`assets/`)
- `app-icon.png` — the glowing-padlock app mark.

**Other**
- `SKILL.md` — lets this system load as a downloadable Agent Skill.
