import React from "react";

/**
 * Pill — a small rounded chip used for status, visit/level, streaks, and
 * tags. Tinted (`tone` color at ~13% opacity behind colored text) by default,
 * or `solid`. Optional leading dot or icon. This is the app's badge workhorse.
 */
export function Pill({ tone = "var(--mu-amber)", solid = false, dot = false, icon, children, style, ...rest }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "4px 10px",
        borderRadius: "var(--r-pill)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--fs-2xs)",
        fontWeight: "var(--fw-semibold)",
        lineHeight: 1.3,
        whiteSpace: "nowrap",
        color: solid ? "#fff" : tone,
        background: solid ? tone : `color-mix(in srgb, ${tone} 13%, transparent)`,
        ...style,
      }}
      {...rest}
    >
      {dot ? (
        <span style={{ width: 6, height: 6, borderRadius: 999, background: tone, flexShrink: 0 }} />
      ) : null}
      {icon}
      {children}
    </span>
  );
}
