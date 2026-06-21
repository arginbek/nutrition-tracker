import * as React from "react";

export interface MeterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional label shown top-left. */
  label?: React.ReactNode;
  /** Optional count/value text shown top-right. */
  count?: React.ReactNode;
  /** Fill amount. */
  value: number;
  /** Maximum for the fill (default 1). */
  max?: number;
  /** Fill color (default amber; often the app's brand color). */
  color?: string;
}

/** Thin labeled usage/progress bar (6px track). */
export function MeterBar(props: MeterBarProps): React.JSX.Element;
