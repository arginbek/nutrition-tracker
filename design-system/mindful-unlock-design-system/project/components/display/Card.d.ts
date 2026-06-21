import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tint the border with this color at ~33% opacity (amber, success, …). */
  accent?: string;
  /** Inner padding in px or any CSS length (default 20). */
  padding?: number | string;
  children?: React.ReactNode;
}

/**
 * 16px-radius surface panel with a hairline border (no shadow).
 * @startingPoint section="Display" subtitle="Base surface card" viewport="700x200"
 */
export function Card(props: CardProps): React.JSX.Element;
