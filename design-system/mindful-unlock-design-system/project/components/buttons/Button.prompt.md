**Button** — the app's primary tap target; solid amber with dark text, full-width inside cards.

```jsx
<Button icon={<Feather name="unlock" />}>Start Unlock Ritual</Button>
<Button variant="commit" icon={<Feather name="check" />}>I commit to this oath</Button>
<Button variant="secondary" fullWidth={false}>Edit</Button>
<Button variant="destructive">Yes, emergency unlock</Button>
```

Variants: `primary` (amber), `secondary` (muted fill + hairline border), `commit` (oath purple), `destructive` (red), `ghost`. Sizes `sm | md | lg`. Icons sit to the right by default (`iconPosition="left"` to flip). Disabled drops to 40% opacity.
