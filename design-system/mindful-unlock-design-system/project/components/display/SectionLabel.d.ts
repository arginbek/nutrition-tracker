import * as React from "react";

export interface SectionLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

/** Uppercase, letter-spaced muted eyebrow that titles a group of rows. */
export function SectionLabel(props: SectionLabelProps): React.JSX.Element;
