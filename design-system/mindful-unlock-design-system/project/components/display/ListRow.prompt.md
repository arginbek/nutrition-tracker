**ListRow** — tappable app/list row: leading `IconTile`, title with optional meta pills, optional trailing element.

```jsx
<ListRow
  icon={<IconTile color="#E1306C"><Feather name="instagram" /></IconTile>}
  title="Instagram"
  meta={<><Pill tone="var(--mu-level-2)" dot>2 today</Pill><Pill tone="var(--mu-amber)" icon={<Feather name="trending-up" />}>5d</Pill></>}
  trailing={<Feather name="chevron-right" color="var(--text-muted)" />}
  onClick={() => openRitual(id)}
/>
```
