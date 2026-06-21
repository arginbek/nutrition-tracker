# Mindful Unlock — UI Kit

An interactive, high-fidelity recreation of the **Mindful Unlock** iOS app (an
intention-before-access "app blocker"). Open `index.html` for a click-through
phone running the real surfaces.

## What you can do in the demo
- **Apps tab** — see the shield status, tracked apps with today's open count and
  streaks, and recent sessions. Tap any tracked app, or *Start Unlock Ritual*.
- **Unlock ritual** — the signature flow. Write your intention → (on a 3rd+ visit)
  swear a solemn oath → sit through a reflection countdown → get a timed session →
  it's recorded to the journal. Visit number drives the escalation color.
- **Journal tab** — every session grouped by day, with intention / necessity / oath
  blocks and emergency + delayed tags.
- **Insights tab** — summary stats, most-opened bars, difficulty distribution, and
  a time-of-day heatmap.
- **Redesigned Screen Time picker** — tap the amber ⚙ button on the Apps tab. This
  is the *improved* "hybrid native" surface: a branded, frosted bottom sheet that
  replaces iOS's jarring stock Family Activity / Screen Time picker.

## Files
- `index.html` — entry; loads React + the design-system bundle + the screens.
- `frame.jsx` — phone bezel, iOS status bar, `Feather` helper, app catalog.
- `home.jsx`, `journal.jsx`, `insights.jsx` — the three tabs.
- `ritual.jsx` — the multi-step unlock flow.
- `picker.jsx` — `BottomSheet`, `UnlockPicker`, and the redesigned `BlockSheet`.
- `app.jsx` — tab navigation + overlays + seed data.

Screens compose the design system's own primitives (`Button`, `Card`, `Pill`,
`IconTile`, `ListRow`, `StatTile`, `MeterBar`, `Field`, `Checkbox`, `TabBar`,
`SectionLabel`) — they are cosmetic recreations, not the production React Native code.

> Source of truth: `arginbek/Focus-Blocker` → `artifacts/mobile` (Expo / React Native).
> The native iOS Screen Time picker lives in `ios-native/FamilyPickerView.swift`; the
> `BlockSheet` here is our on-brand replacement for it.
