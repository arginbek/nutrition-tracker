import * as React from "react";

export interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface TabBarProps extends React.HTMLAttributes<HTMLElement> {
  items: TabItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
}

/**
 * Translucent, blurred bottom navigation bar (the "hybrid native" chrome).
 * @startingPoint section="Navigation" subtitle="Frosted bottom tab bar" viewport="390x110"
 */
export function TabBar(props: TabBarProps): React.JSX.Element;
