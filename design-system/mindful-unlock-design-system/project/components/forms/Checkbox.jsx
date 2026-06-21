import React from "react";

/**
 * Checkbox — a 24px rounded-square check used in the app-selection list.
 * Amber fill + white tick when checked; hairline border when not.
 */
export function Checkbox({ checked = false, onChange, size = 24, style, ...rest }) {
  return (
    <span
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      style={{
        width: size,
        height: size,
        borderRadius: 7,
        boxSizing: "border-box",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        cursor: "pointer",
        border: checked ? "2px solid var(--mu-amber)" : "2px solid var(--border-hairline)",
        background: checked ? "var(--mu-amber)" : "transparent",
        transition: "background 0.12s ease, border-color 0.12s ease",
        ...style,
      }}
      {...rest}
    >
      {checked ? (
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none"
          stroke="#0A0A0E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : null}
    </span>
  );
}
