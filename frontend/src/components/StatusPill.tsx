// components/StatusPill.tsx
// Colored rounded badge for a Status value.
// Used in board cards, detail hero, and status history timeline.

import { STATUS_STYLES, STATUS_LABELS } from "../constants/status";
import type { Status } from "../types";

interface Props {
  status: Status;
  className?: string;
}

export default function StatusPill({ status, className = "" }: Props) {
  const { bg, fg } = STATUS_STYLES[status];
  return (
    <span
      className={`whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-full border ${className}`}
      style={{ backgroundColor: bg, color: fg, borderColor: fg + "60" }}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
