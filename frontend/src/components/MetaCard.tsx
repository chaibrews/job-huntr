// components/MetaCard.tsx
// White bordered card with a small uppercase label and content slot.
// Used throughout ApplicationDetail for Status, Work Setup, Tags, etc.

import type { ReactNode } from "react";

interface Props {
  label: string;
  children: ReactNode;
  className?: string;
}

export default function MetaCard({ label, children, className = "" }: Props) {
  return (
    <div
      className={`bg-white rounded-lg border border-shadow p-4 min-w-0 overflow-hidden ${className}`}
      // <div className={`bg-white rounded-lg border border-shadow p-4 min-w-0 overflow-hidden ${className}`}>
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-2">
        {label}
      </p>
      {children}
    </div>
  );
}
