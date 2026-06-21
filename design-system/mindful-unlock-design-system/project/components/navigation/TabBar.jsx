import React from "react";

/**
 * TabBar — the app's bottom navigation: a translucent, blurred bar pinned to
 * the bottom of the screen with a hairline top border. Active tab in amber,
 * inactive in muted. This is the "hybrid native" chrome — frosted glass over
 * the dark canvas rather than an opaque slab.
 */
export function TabBar({ items = [], activeId, onSelect, style, ...rest }) {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "stretch",
        justifyContent: "space-around",
        gap: "4px",
        padding: "8px 12px 22px",
        background: "color-mix(in srgb, var(--mu-black) 72%, transparent)",
        backdropFilter: "saturate(140%) blur(20px)",
        WebkitBackdropFilter: "saturate(140%) blur(20px)",
        borderTop: "1px solid var(--border-hairline)",
        ...style,
      }}
      {...rest}
    >
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            onClick={() => onSelect && onSelect(item.id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              padding: "6px 0",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: active ? "var(--accent-primary)" : "var(--text-muted)",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span style={{ display: "flex" }}>{item.icon}</span>
            <span style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--fs-2xs)",
              fontWeight: active ? "var(--fw-semibold)" : "var(--fw-medium)",
            }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
