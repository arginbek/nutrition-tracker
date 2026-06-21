---
name: mindful-unlock-design
description: Use this skill to generate well-branded interfaces and assets for Mindful Unlock — a calm, dark, intention-driven iOS app family (focus / habit / mindfulness tools), either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets
out and create static HTML files for the user to view. If working on production code,
you can copy assets and read the rules here to become an expert in designing with this
brand.

If the user invokes this skill without any other guidance, ask them what they want to
build or design, ask some questions, and act as an expert designer who outputs HTML
artifacts _or_ production code, depending on the need.

## Where things are
- `readme.md` — the full design guide: voice, color, type, spacing, iconography, index.
- `styles.css` — link this one file to inherit every token; or copy the values from `tokens/`.
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `fonts.css`.
- `components/` — React primitives (Button, IconTile, Pill, Card, StatTile, MeterBar,
  ListRow, SectionLabel, Field, Checkbox, TabBar). Each has a `.prompt.md` with usage.
- `ui_kits/mindful-unlock/` — a full interactive iOS recreation to copy screens from.
- `guidelines/*.html` — foundation specimen cards.
- `assets/app-icon.png` — the glowing-padlock app mark.

## Non-negotiables (the brand in one breath)
- Dark near-black canvas (`#0A0A0E`), warm off-white text (`#F0EDE8`), one amber accent
  (`#F59E0B`); purple (`#7C3AED`) only for oath / commitment moments.
- Icons & pills sit in full brand color over a ~13%-opacity wash of that same color.
- One typeface: **Inter**, weights 400/500/600/700. **16px** is the signature card radius.
- Cards = flat surface + 1px hairline border, **no shadow**; signal state by tinting the
  border. Blur + translucency only on floating chrome (tab bar, sheets).
- Voice: calm, second-person, quietly firm; ritual words (intention / oath / vow); no
  emoji; copy escalates from gentle to ceremonial. Feedback is opacity, not color/scale.
- Use **Feather** icons only; third-party apps = closest Feather glyph tinted in the
  brand's color inside an `IconTile`. Never invent SVG icons or use emoji as icons.
