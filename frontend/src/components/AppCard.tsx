// Individual application card shown in kanban columns.
// The … menu reveals Delete and Archive actions.

import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, memo } from "react";
import { MoreHorizontal, Trash2, Archive } from "lucide-react";
import type { Application } from "../types";
import CompanyAvatar from "./CompanyAvatar";

interface Props {
  app: Application;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}

function AppCard({ app, onDelete, onArchive }: Props) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <div
      onClick={() => navigate(`/applications/${app.id}`)}
      className="bg-white/50 rounded-xl p-4 cursor-pointer border border-primary/20
                 hover:shadow-md hover:border-primary/30 transition-all duration-150 group"
    >
      {/* Top row: avatar + company + location + menu */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <CompanyAvatar company={app.company} size="sm" />
          <div className="min-w-0">
            <p className="text-sm uppercase font-medium text-foreground truncate">
              {app.company}
            </p>
            {app.location && (
              <div className="text-xs text-foreground/40 truncate flex items-center gap-1">
                <span>{app.location}</span>
                {/* Work Setup */}
                {app.workSetup && (
                  <span className="capitalize">
                    | {app.workSetup.toLowerCase()}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* … menu */}
        <div
          ref={menuRef}
          className="relative shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-6 h-6 rounded-md flex items-center justify-center cursor-pointer
                       text-foreground/30 hover:text-foreground/60 hover:bg-background
                       transition-colors sm:opacity-0 sm:group-hover:opacity-100"
          >
            <MoreHorizontal size={14} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-7 z-20 bg-white border border-shadow rounded-lg shadow-lg overflow-hidden w-40">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive(app.id);
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-foreground/60
                           hover:bg-background cursor-pointer transition-colors"
              >
                <Archive size={12} />
                Archive
              </button>
              <div className="border-t border-shadow" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete application to ${app.company}?`)) {
                    onDelete(app.id);
                  }
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500
                           hover:bg-red-50 cursor-pointer transition-colors"
              >
                <Trash2 size={12} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Role */}
      <p className="break-words text-[16px] font-normal text-foreground leading-snug">
        {app.role}
      </p>

      {/* Tags */}
      {app.tags && app.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {app.tags.map((tag) => (
            <span
              key={tag.id}
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: tag.color + "22",
                color: tag.color,
                border: `1px solid ${tag.color}55`,
              }}
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(AppCard);
