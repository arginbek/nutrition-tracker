import React from "react";

/**
 * Button — Mindful Unlock's primary action control.
 *
 * Solid amber by default (dark text on warm amber), with calm secondary,
 * commitment-purple, and destructive variants. Full-width inside cards by
 * default, matching the app's stacked-CTA layout. Pass `icon` (any node,
 * usually a Feather glyph) to sit it after the label.
 */
export function Button({
  variant = "primary",
  size = "md",
  fullWidth = true,
  icon,
  iconPosition = "right",
  disabled = false,
  children,
  style,
  ...rest
}) {
  const palette = {
    primary:     { bg: "var(--mu-amber)",     fg: "var(--text-on-accent)", border: "transparent" },
    commit:      { bg: "var(--mu-purple)",    fg: "#fff",                  border: "transparent" },
    destructive: { bg: "var(--mu-danger)",    fg: "#fff",                  border: "transparent" },
    secondary:   { bg: "var(--mu-secondary)", fg: "var(--text-primary)",   border: "var(--border-hairline)" },
    ghost:       { bg: "transparent",         fg: "var(--accent-primary)", border: "transparent" },
  }[variant] || {};

  const sizing = {
    sm: { pad: "10px 16px", fs: "var(--fs-base)",   radius: "var(--r-md)" },
    md: { pad: "14px 24px", fs: "var(--fs-subhead)", radius: "var(--r-lg)" },
    lg: { pad: "16px 24px", fs: "var(--fs-subhead)", radius: "var(--r-lg)" },
  }[size] || {};

  return (
    <button
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        width: fullWidth ? "100%" : "auto",
        padding: sizing.pad,
        fontFamily: "var(--font-sans)",
        fontSize: sizing.fs,
        fontWeight: "var(--fw-bold)",
        lineHeight: 1,
        color: palette.fg,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        borderRadius: sizing.radius,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "opacity 0.15s ease, transform 0.05s ease",
        WebkitTapHighlightColor: "transparent",
        ...style,
      }}
      {...rest}
    >
      {icon && iconPosition === "left" ? icon : null}
      {children}
      {icon && iconPosition === "right" ? icon : null}
    </button>
  );
}
