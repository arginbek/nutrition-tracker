import * as React from "react";

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Accent color (text + 13% background, or full background when solid). */
  tone?: string;
  /** Fill the pill with `tone` and use white text. */
  solid?: boolean;
  /** Show a leading status dot in `tone`. */
  dot?: boolean;
  /** Optional leading icon node. */
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Small rounded status / level / streak chip.
 * @startingPoint section="Display" subtitle="Status & level pills" viewport="700x140"
 */
export function Pill(props: PillProps): React.JSX.Element;
