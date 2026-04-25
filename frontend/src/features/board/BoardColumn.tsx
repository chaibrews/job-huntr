// A single kanban column — renders the header with count badge
// and a list of AppCard components.

import { Plus } from "lucide-react";
import type { Application, Status } from "../../types";
import AppCard from "../../components/AppCard";

interface Props {
  status: Status;
  label: string;
  applications: Application[];
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onAddClick?: (status: Status) => void;
}

export default function BoardColumn({
  status,
  label,
  applications,
  onDelete,
  onArchive,
  onAddClick,
}: Props) {
  return (
    <div className="flex flex-col gap-3 min-w-0">
      {/* Column header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-[16px] font-medium text-foreground">{label}</h3>
          <span
            className="w-5 h-5 rounded-full bg-primary/15 text-primary-darker
                           text-xs font-semibold flex items-center justify-center"
          >
            {applications.length}
          </span>
        </div>
        <button
          onClick={() => onAddClick?.(status)}
          className="w-6 h-6 rounded-md flex items-center justify-center
                     text-foreground/30 hover:text-primary-darker hover:bg-primary/10
                     transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {applications.length === 0 && (
          <p className="text-xs text-foreground/25 text-center py-6">
            No applications yet
          </p>
        )}
        {applications.map((app) => (
          <AppCard
            key={app.id}
            app={app}
            onDelete={onDelete}
            onArchive={onArchive}
          />
        ))}
      </div>
    </div>
  );
}
