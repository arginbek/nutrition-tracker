import * as React from "react";

export interface ListRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Leading element, usually an <IconTile>. */
  icon?: React.ReactNode;
  title?: React.ReactNode;
  /** Optional meta row beneath the title (usually <Pill>s). */
  meta?: React.ReactNode;
  /** Optional trailing element (chevron, Checkbox, trash icon). */
  trailing?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * Tappable app/list row: IconTile + title + meta pills + trailing affordance.
 * @startingPoint section="Display" subtitle="Tappable app list row" viewport="700x110"
 */
export function ListRow(props: ListRowProps): React.JSX.Element;
