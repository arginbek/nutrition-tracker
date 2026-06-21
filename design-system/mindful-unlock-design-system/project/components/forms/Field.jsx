import React from "react";

/**
 * Field — the reflection text input used in the unlock ritual. A card-colored
 * box with hairline border; multiline by default (the ritual asks for a few
 * sentences). Pass `accent` to tint the border (purple for oath steps).
 */
export function Field({ multiline = true, rows = 4, accent, style, ...rest }) {
  const borderColor = accent
    ? `color-mix(in srgb, ${accent} 44%, transparent)`
    : "var(--border-hairline)";
  const shared = {
    width: "100%",
    boxSizing: "border-box",
    background: "var(--surface-card)",
    border: `1px solid ${borderColor}`,
    borderRadius: "var(--r-lg)",
    padding: "16px",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--fs-body)",
    lineHeight: "var(--lh-snug)",
    color: "var(--text-primary)",
    outline: "none",
    resize: "none",
    ...style,
  };
  if (multiline) {
    return <textarea rows={rows} style={{ ...shared, minHeight: 120 }} {...rest} />;
  }
  return <input type="text" style={shared} {...rest} />;
}
