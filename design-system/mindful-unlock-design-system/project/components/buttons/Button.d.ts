import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. `primary` = solid amber; `commit` = oath purple. */
  variant?: "primary" | "secondary" | "commit" | "destructive" | "ghost";
  size?: "sm" | "md" | "lg";
  /** Stretch to fill its container (default true — the app stacks CTAs). */
  fullWidth?: boolean;
  /** Optional icon node (e.g. a Feather SVG) rendered beside the label. */
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * Primary tap target. Solid amber with dark text; full-width inside cards.
 * @startingPoint section="Buttons" subtitle="Amber primary action button" viewport="700x180"
 */
export function Button(props: ButtonProps): React.JSX.Element;
