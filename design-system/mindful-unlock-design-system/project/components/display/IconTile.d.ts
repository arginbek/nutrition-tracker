import * as React from "react";

export interface IconTileProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Brand color of the glyph; the background is this color at ~13% opacity. */
  color?: string;
  /** Square edge length in px (default 46). */
  size?: number;
  /** Corner radius in px (defaults to ~28% of size). */
  radius?: number;
  children?: React.ReactNode;
}

/**
 * Color-tinted rounded square holding an app/feature icon.
 * @startingPoint section="Display" subtitle="Tinted app-icon tile" viewport="700x160"
 */
export function IconTile(props: IconTileProps): React.JSX.Element;
