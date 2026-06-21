import React from "react";

/**
 * StatTile — a compact metric cell: a small amber icon, a big bold number,
 * and a caption. Used in the Insights summary row (three across).
 */
export function StatTile({ icon, value, label, style, ...rest }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        background: "var(--surface-card)",
        border: "1px solid var(--border-hairline)",
        borderRadius: "var(--r-lg)",
        padding: "14px",
        textAlign: "center",
        ...style,
      }}
      {...rest}
    >
      <span style={{ color: "var(--accent-primary)", display: "flex" }}>{icon}</span>
      <span style={{
        fontFamily: "var(--font-sans)", fontSize: "22px",
        fontWeight: "var(--fw-bold)", color: "var(--text-primary)", lineHeight: 1.1,
      }}>{value}</span>
      <span style={{
        fontFamily: "var(--font-sans)", fontSize: "var(--fs-2xs)",
        color: "var(--text-muted)", lineHeight: 1.3,
      }}>{label}</span>
    </div>
  );
}
