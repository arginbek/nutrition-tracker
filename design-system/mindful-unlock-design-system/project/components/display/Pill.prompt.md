**Pill** — small rounded chip for status, visit/level, streaks, and tags. Tinted by default; `solid` for emphasis.

```jsx
<Pill tone="var(--mu-success)" dot>On</Pill>
<Pill tone="var(--mu-level-3)">Visit 3</Pill>
<Pill tone="var(--mu-amber)" icon={<Feather name="trending-up" />}>5d</Pill>
<Pill tone="var(--mu-danger)" icon={<Feather name="alert-triangle" />}>Emergency</Pill>
```

Use the escalation tokens (`--mu-level-1..4`) for visit/difficulty pills. `dot` adds a leading status dot; `icon` adds a leading glyph.
