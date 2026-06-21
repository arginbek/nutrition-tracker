import React from "react";

/**
 * SectionLabel — the uppercase, letter-spaced eyebrow that titles a group of
 * rows ("TRACKED APPS", "RECENT SESSIONS"). Muted by default.
 */
export function SectionLabel({ children, style, ...rest }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "var(--fs-sm)",
        fontWeight: "var(--fw-semibold)",
        textTransform: "uppercase",
        letterSpacing: "var(--ls-label)",
        color: "var(--text-muted)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
