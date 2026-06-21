**MeterBar** — thin labeled usage bar (6px track, colored fill). Used for "Most Opened Apps".

```jsx
<MeterBar label="Instagram" count="8x" value={8} max={8} color="#E1306C" />
<MeterBar label="YouTube" count="3x" value={3} max={8} color="#FF0000" />
```

Pass each app's brand color as the fill. Omit `label`/`count` for a bare track.
