import * as React from "react";

export interface StatTileProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Small icon node, rendered in amber. */
  icon?: React.ReactNode;
  /** Big bold metric, e.g. "12" or "3h". */
  value?: React.ReactNode;
  /** Caption beneath the value. */
  label?: React.ReactNode;
}

/** Compact metric cell for the Insights summary row. */
export function StatTile(props: StatTileProps): React.JSX.Element;
