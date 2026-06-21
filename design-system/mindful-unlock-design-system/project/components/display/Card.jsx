import React from "react";

/**
 * Card — the base surface for Mindful Unlock. A 16px-radius panel on the
 * card background with a hairline border (no drop shadow — the dark theme
 * uses borders + tinted fills for separation). Use `accent` to tint the
 * border (e.g. amber for the ritual prompt, success for an active shield).
 */
export function Card({ accent, padding = 20, children, style, ...rest }) {
  const borderColor = accent
    ? `color-mix(in srgb, ${accent} 33%, transparent)`
    : "var(--border-hairline)";
  return (
    <div
      style={{
        background: "var(--surface-card)",
        border: `1px solid ${borderColor}`,
        borderRadius: "var(--r-xl)",
        padding: typeof padding === "number" ? `${padding}px` : padding,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
