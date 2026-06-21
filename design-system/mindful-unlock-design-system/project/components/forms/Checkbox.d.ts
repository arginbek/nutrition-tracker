import * as React from "react";

export interface CheckboxProps extends React.HTMLAttributes<HTMLSpanElement> {
  checked?: boolean;
  /** Click handler (toggle). */
  onChange?: (e: React.MouseEvent) => void;
  /** Edge length in px (default 24). */
  size?: number;
}

/** Rounded-square checkbox; amber fill + white tick when checked. */
export function Checkbox(props: CheckboxProps): React.JSX.Element;
