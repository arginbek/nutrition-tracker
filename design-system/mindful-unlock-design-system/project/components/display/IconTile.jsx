import React from "react";

/**
 * IconTile — the rounded, color-tinted square that holds an app or feature
 * icon throughout Mindful Unlock. The glyph sits in full brand color on a
 * ~13%-opacity wash of the same color. This single motif appears on every
 * list row, stat, and ritual header.
 */
export function IconTile({ color = "var(--mu-amber)", size = 46, radius, children, style, ...rest }) {
  const r = radius != null ? radius : Math.round(size * 0.28);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: r,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: color,
        background: `color-mix(in srgb, ${color} 13%, transparent)`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
