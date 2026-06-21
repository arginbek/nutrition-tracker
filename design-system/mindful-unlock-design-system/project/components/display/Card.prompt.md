**Card** — the base surface: 16px radius, card background, hairline border, no shadow. Tint the border with `accent` to signal state.

```jsx
<Card>…</Card>
<Card accent="var(--mu-amber)">Need to open a blocked app?</Card>
<Card accent="var(--mu-success)" padding={16}>Shield Active</Card>
```

Stick to border tints (amber for prompts, success for active state) rather than shadows — the dark theme separates surfaces with borders and tinted fills.
