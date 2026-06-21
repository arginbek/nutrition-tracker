import React from "react";

/**
 * ListRow — the tappable row used for tracked/selectable apps: a leading
 * IconTile, a title with optional meta pills beneath, and an optional trailing
 * element (chevron, checkbox, trash). A card surface with hairline border.
 */
export function ListRow({ icon, title, meta, trailing, onClick, style, ...rest }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        background: "var(--surface-card)",
        border: "1px solid var(--border-hairline)",
        borderRadius: "var(--r-xl)",
        padding: "14px 16px",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
      {...rest}
    >
      {icon}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "5px" }}>
        <span style={{
          fontFamily: "var(--font-sans)", fontSize: "var(--fs-body)",
          fontWeight: "var(--fw-semibold)", color: "var(--text-primary)",
        }}>{title}</span>
        {meta ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>{meta}</div>
        ) : null}
      </div>
      {trailing}
    </div>
  );
}
