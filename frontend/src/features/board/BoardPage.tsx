import { useState, useCallback, useMemo } from "react";
import type { Status, Application } from "../../types";
import { useApplications } from "../../hooks/useApplications";
import { KANBAN_STATUSES, STATUS_LABELS } from "../../constants/status";
import AppShell from "../../components/AppShell";
import BoardSkeleton from "../../components/skeletons/BoardSkeleton";
import BoardColumn from "./BoardColumn";
import ApplicationForm from "../applications/ApplicationForm";
import { Plus, Search } from "lucide-react";
import CompanyAvatar from "../../components/CompanyAvatar";
import { useNavigate } from "react-router-dom";
// import { useAuthContext } from "../../context/AuthContext";
import type { ToastType } from "../../components/Toast";
import Toast from "../../components/Toast";

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
  const [toast, setToast] = useState<{ visible: boolean; type: ToastType }>({
    visible: false,
    type: "saved",
  });

  const [defaultStatus, setDefaultStatus] = useState<Status>("SAVED");
  const [search, setSearch] = useState("");
  // const { user } = useAuthContext();
  const navigate = useNavigate();

  const openForm = useCallback((status: Status = "SAVED") => {
    setDefaultStatus(status);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((id: string) => remove(id), [remove]);
  const handleArchive = useCallback((id: string) => archive(id), [archive]);
  const handleAddClick = useCallback(
    (status: Status) => openForm(status),
    [openForm],
  );

  // Filtered by search term
  const filtered = useMemo(
    () =>
      applications.filter((a) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          a.company.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q) ||
          (a.location ?? "").toLowerCase().includes(q) ||
          a.tags?.some((tag) => tag.name.toLowerCase().includes(q))
        );
      }),
    [applications, search],
  );

  // Group all applications by status
  const grouped = useMemo(
    () =>
      KANBAN_STATUSES.reduce<Record<Status, Application[]>>(
        (acc, status) => {
          acc[status] = filtered.filter((a) => a.status === status);
          return acc;
        },
        {} as Record<Status, Application[]>,
      ),
    [filtered],
  );

  // Which statuses to show in current tab
  const visibleStatuses = TAB_STATUSES[activeTab].filter((s) =>
    KANBAN_STATUSES.includes(s),
  );

  return (
    <div className="min-h-screen">
      <AppShell
        headerLeft={
          // Search bar
          <div className="relative w-full md:w-auto">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find by company, role, or tag…"
              className="pl-9 pr-4 py-2 text-sm bg-white/40 border border-shadow rounded-lg 
                       w-full md:w-60 lg:w-xl focus:outline-none focus:border-primary-darker/40 transition-colors"
            />
          </div>
        }
        headerRight={
          <div className="flex w-full items-center gap-2 md:w-auto">
            <button
              onClick={() => handleAddClick("SAVED")}
              className="primary-button text-sm flex min-w-0 flex-1 items-center justify-center gap-1.5  border-primary px-3 sm:flex-none sm:px-4"
            >
              <Plus size={15} />
              <span className="truncate">New Application</span>
            </button>
            {/* <div className="hidden md:flex w-10 h-10 rounded-lg bg-primary-darker/90 border-2 border-primary items-center justify-center text-white text-sm font-bold shrink-0">
              {user?.email?.[0]?.toUpperCase() ?? "U"}
            </div> */}
          </div>
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

        {loading && <BoardSkeleton />}

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
                  gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 18rem), 1fr))`,
                }}
              >
                {visibleStatuses.map((status) => (
                  <BoardColumn
                    key={status}
                    status={status}
                    label={STATUS_LABELS[status]}
                    applications={grouped[status] ?? []}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                    onAddClick={handleAddClick}
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
                      className="grid gap-2 bg-white/40 border border-shadow rounded-lg px-4 py-3 cursor-pointer hover:shadow-sm transition-all sm:flex sm:items-center sm:gap-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <CompanyAvatar company={app.company} size="sm" />
                        <span className="truncate text-sm font-medium text-foreground">
                          {app.company}
                        </span>
                      </div>
                      <span className="min-w-0 break-words text-sm text-foreground/60 sm:truncate">
                        {app.role}
                      </span>
                      {app.location && (
                        <span className="min-w-0 truncate text-xs text-foreground/40">
                          {app.location}
                        </span>
                      )}
                      <div className="flex items-center gap-3 sm:ml-auto">
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
              setShowForm(false);
              setToast({
                visible: true,
                type: data.status.toLowerCase() as ToastType,
              });
              try {
                await create(data);
              } catch (err) {
                console.error("Failed to create application", err);
              }
            }}
          />
        )}
      </AppShell>
      <Toast
        visible={toast.visible}
        type={toast.type}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </div>
  );
}
