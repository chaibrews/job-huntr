import { useState } from "react";
// import { useAuth } from "../../hooks/useAuth";
import type { Status, Application } from "../../types";
import { useApplications } from "../../hooks/useApplications";
import { KANBAN_STATUSES, STATUS_LABELS } from "../../constants/status";
import AppShell from "../../components/AppShell";
import BoardColumn from "./BoardColumn";
import ApplicationForm from "../applications/ApplicationForm";
import { Plus, Search } from "lucide-react";
import CompanyAvatar from "../../components/CompanyAvatar";
import { useNavigate } from "react-router-dom";

type Tab = "applications" | "offers" | "archived";

const TABS: { key: Tab; label: string }[] = [
  { key: "applications", label: "Applications" },
  { key: "offers", label: "Offers" },
  { key: "archived", label: "Archived" },
];

// Which statuses show under each tab
const TAB_STATUSES: Record<Tab, Status[]> = {
  applications: ["SAVED", "APPLIED", "INTERVIEW"],
  offers: ["OFFER"],
  archived: ["REJECTED", "ARCHIVED"],
};

export default function BoardPage() {
  const {
    applications,
    loading,
    error,
    remove,
    archive,
    create,
    changeStatus,
  } = useApplications();
  const [activeTab, setActiveTab] = useState<Tab>("applications");
  const [showForm, setShowForm] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<Status>("SAVED");
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  // Filtered by search term
  const filtered = applications.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.company.toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q) ||
      (a.location ?? "").toLowerCase().includes(q) ||
      a.tags?.some((tag) => tag.name.toLowerCase().includes(q))
    );
  });

  // Group all applications by status
  const grouped = KANBAN_STATUSES.reduce<Record<Status, Application[]>>(
    (acc, status) => {
      acc[status] = filtered.filter((a) => a.status === status);
      return acc;
    },
    {} as Record<Status, Application[]>,
  );

  // Which statuses to show in current tab
  const visibleStatuses = TAB_STATUSES[activeTab].filter((s) =>
    KANBAN_STATUSES.includes(s),
  );

  function openForm(status: Status = "SAVED") {
    setDefaultStatus(status);
    setShowForm(true);
  }

  return (
    <div className="min-h-screen">
      <AppShell
        headerLeft={
          // Search bar
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="pl-9 pr-4 py-2 text-sm bg-white border border-shadow rounded-lg
                       w-xl focus:outline-none focus:border-primary-darker/40 transition-colors"
            />
          </div>
        }
        headerRight={
          <button
            onClick={() => openForm("SAVED")}
            className="primary-button flex items-center gap-1.5 px-4 text-sm"
          >
            <Plus size={15} />
            <span className="text-sm">New Application</span>
          </button>
        }
      >
        {/* ── TABS ── */}
        <div className="flex items-center gap-6 border-b border-shadow mb-6 -mt-2">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`pb-3 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-px ${
                activeTab === key
                  ? "text-primary-darker border-primary-darker"
                  : "text-foreground/40 border-transparent hover:text-foreground/70"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── BOARD ── */}
        {loading && (
          <p className="text-sm text-primary text-center py-12">Loading…</p>
        )}
        {error && (
          <p className="text-sm text-red-400 text-center py-12">{error}</p>
        )}

        {!loading && !error && (
          <>
            {/* Kanban view forapplications tabs */}
            {activeTab === "applications" && (
              <div
                className="grid gap-5"
                style={{
                  gridTemplateColumns: `repeat(${visibleStatuses.length}, minmax(0, 1fr))`,
                }}
              >
                {visibleStatuses.map((status) => (
                  <BoardColumn
                    key={status}
                    status={status}
                    label={STATUS_LABELS[status]}
                    applications={grouped[status] ?? []}
                    onDelete={remove}
                    onArchive={archive}
                    onAddClick={openForm}
                  />
                ))}
              </div>
            )}

            {/* Placeholder for Offers tab — will be its own page/component */}
            {activeTab === "offers" && (
              <p className="text-sm text-foreground/40 text-center py-12">
                Offers page coming soon.
              </p>
            )}

            {/* Archived / Rejected — simple list for now */}
            {activeTab === "archived" && (
              <div className="flex flex-col gap-2">
                {filtered
                  .filter((a) => TAB_STATUSES.archived.includes(a.status))
                  .map((app) => (
                    <div
                      key={app.id}
                      onClick={() => navigate(`/applications/${app.id}`)}
                      className="bg-white border border-shadow rounded-lg px-4 py-3 flex items-center gap-4 cursor-pointer hover:shadow-sm transition-all"
                    >
                      <CompanyAvatar company={app.company} size="sm" />
                      <span className="text-sm font-medium text-foreground">
                        {app.company}
                      </span>
                      <span className="text-sm text-foreground/60">
                        {app.role}
                      </span>
                      {app.location && (
                        <span className="text-xs text-foreground/40">
                          {app.location}
                        </span>
                      )}
                      <div className="ml-auto flex items-center gap-3">
                        <span className="text-xs text-foreground/40 capitalize">
                          {app.status.toLowerCase()}
                        </span>
                        {/* Restore button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            changeStatus(app.id, "SAVED");
                          }}
                          className="text-xs px-2.5 py-1 rounded-lg cursor-pointer bg-primary/10 text-primary-darker hover:bg-primary/20 transition-colors"
                        >
                          Restore
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}

        {/* ── FORM MODAL ── */}
        {showForm && (
          <ApplicationForm
            defaultStatus={defaultStatus}
            onClose={() => setShowForm(false)}
            onCreate={async (data) => {
              try {
                await create(data); // call the hook’s create function
                setShowForm(false); // close the modal after success
              } catch (err) {
                console.error("Failed to create application", err);
              }
            }}
          />
        )}
      </AppShell>
    </div>
  );
}
