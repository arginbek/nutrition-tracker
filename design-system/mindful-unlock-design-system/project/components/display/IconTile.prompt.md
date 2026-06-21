**IconTile** — rounded color-tinted square holding an app or feature icon (the glyph in full color over a 13% wash). The app's most repeated motif.

```jsx
<IconTile color="#E1306C" size={46}><Feather name="instagram" /></IconTile>
<IconTile color="var(--mu-amber)" size={34}><Feather name="lock" /></IconTile>
```

`size` sets the square; `radius` defaults to ~28% of size (so it scales from 34px badges up to 72px ritual headers). Pass the app's brand color and the tile auto-tints its background.
