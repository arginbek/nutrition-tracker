import React from "react";

/**
 * MeterBar — a thin horizontal progress/usage bar. A label row (name + count)
 * sits above a 6px track with a colored fill. Used in "Most Opened Apps".
 */
export function MeterBar({ label, value, max = 1, count, color = "var(--mu-amber)", style, ...rest }) {
  const pct = Math.max(0, Math.min(1, max ? value / max : 0)) * 100;
  return (
    <div style={{ ...style }} {...rest}>
      {(label != null || count != null) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-sm)", fontWeight: "var(--fw-medium)", color: "var(--text-primary)" }}>{label}</span>
          {count != null && (
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-sm)", color: "var(--text-muted)" }}>{count}</span>
          )}
        </div>
      )}
      <div style={{ height: 6, background: "var(--mu-secondary)", borderRadius: "var(--r-pill)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "var(--r-pill)" }} />
      </div>
    </div>
  );
}
