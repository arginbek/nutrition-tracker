import * as React from "react";

type Base = React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export interface FieldProps extends Base {
  /** Multiline textarea (default true) vs single-line input. */
  multiline?: boolean;
  /** Visible rows when multiline (default 4). */
  rows?: number;
  /** Tint the border, e.g. purple for oath steps. */
  accent?: string;
}

/** Reflection text input for the unlock ritual (multiline by default). */
export function Field(props: FieldProps): React.JSX.Element;
