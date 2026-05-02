// features/applications/ApplicationDetail.tsx
// Full detail view for a single application.
// Layout: hero header + two-column grid (meta left, timeline/docs/notes right).
// All fields are editable in place using the InlineEdit component.

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Trash2 } from "lucide-react";
import type { Application, Status, WorkSetup } from "../../types";
import { getApplicationById } from "../../api/applications";
import { useApplications } from "../../hooks/useApplications";
import {
  ALL_STATUSES,
  STATUS_LABELS,
  STATUS_STYLES,
} from "../../constants/status";
import AppShell from "../../components/AppShell";
import CompanyAvatar from "../../components/CompanyAvatar";
import StatusPill from "../../components/StatusPill";
import MetaCard from "../../components/MetaCard";
import InlineEdit from "../../components/InlineEdit";
import TagInput from "../../components/TagInput";
import ApplicationDetailSkeleton from "../../components/skeletons/ApplicationDetailSkeleton";

const WORK_OPTIONS: { value: WorkSetup; label: string }[] = [
  { value: "ONSITE", label: "On-site" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "REMOTE", label: "Remote" },
];

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { applications, changeStatus, update, remove } = useApplications();

  const cached = applications.find((a) => a.id === id) ?? null;
  const [app, setApp] = useState<Application | null>(cached);
  const [loading, setLoading] = useState(!app); // skip spinner if we have cached data
  const [error, setError] = useState<string | null>(null);

  // Initialize drafts from whatever we have — cache or null
  const [notesDraft, setNotesDraft] = useState(cached?.notes ?? "");
  const [companyDraft, setCompanyDraft] = useState(cached?.company ?? "");
  const [roleDraft, setRoleDraft] = useState(cached?.role ?? "");
  const [locationDraft, setLocationDraft] = useState(cached?.location ?? "");
  const [jobDescDraft, setJobDescDraft] = useState(
    cached?.jobDescription ?? "",
  );
  const [companyNotesDraft, setCompanyNotesDraft] = useState(
    cached?.companyNotes ?? "",
  );

  useEffect(() => {
    if (!id) return;
    // Always fetch in background to get fresh data (companyNotes, latest statusHistory, etc.)
    getApplicationById(id)
      .then((data) => {
        setApp(data);
        setNotesDraft(data.notes ?? "");
        setCompanyDraft(data.company);
        setRoleDraft(data.role);
        setLocationDraft(data.location ?? "");
        setJobDescDraft(data.jobDescription ?? "");
        setCompanyNotesDraft(data.companyNotes ?? "");
      })
      .catch(() => setError("Application not found"))
      .finally(() => setLoading(false));
  }, [id]);

  // ── handlers ──────────────────────────────────────────

  async function handleStatusChange(status: Status) {
    if (!app) return;
    const previous = app;

    // Optimistically add the new history entry immediately
    setApp((p) =>
      p
        ? {
            ...p,
            status,
            statusHistory: [
              ...p.statusHistory,
              {
                id: `temp-history-${Date.now()}`,
                from: p.status,
                to: status,
                changedAt: new Date().toISOString(),
              },
            ],
          }
        : p,
    );

    try {
      const updated = await changeStatus(app.id, status);
      setApp(updated); // replace temp entry with real one from server
    } catch {
      setApp(previous); // rollback
    }
  }

  async function handleWorkSetupChange(workSetup: WorkSetup | null) {
    if (!app) return;
    setApp((p) => (p ? { ...p, workSetup } : p));
    try {
      const updated = await update(app.id, { workSetup });
      setApp(updated);
    } catch {
      setApp(app);
    }
  }

  async function handleFieldSave(field: string, value: string | null) {
    if (!app) return;

    //   // 1. Update UI immediately
    setApp((p) => (p ? { ...p, [field]: value || null } : p));

    try {
      const updated = await update(app.id, { [field]: value || null });
      setApp(updated);
      // Sync draft state
      if (field === "company") setCompanyDraft(updated.company);
      if (field === "role") setRoleDraft(updated.role);
      if (field === "location") setLocationDraft(updated.location ?? "");
      if (field === "jobDescription")
        setJobDescDraft(updated.jobDescription ?? "");
      if (field === "notes") setNotesDraft(updated.notes ?? "");
      if (field === "companyNotes")
        setCompanyNotesDraft(updated.companyNotes ?? "");
    } catch {
      // 3. Rollback — re-fetch to get clean state
      const reverted = await getApplicationById(app.id);
      setApp(reverted);
    }
  }

  async function handleDelete() {
    if (!app || !confirm(`Delete application to ${app.company}?`)) return;
    await remove(app.id);
    navigate("/");
  }

  // ── render states ──────────────────────────────────────

  if (loading) return <ApplicationDetailSkeleton />;

  if (error || !app)
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-sm text-red-400">{error ?? "Not found"}</p>
          <button
            onClick={() => navigate("/")}
            className="primary-button px-6 py-2 text-sm"
          >
            Back to board
          </button>
        </div>
      </AppShell>
    );

  return (
    <AppShell
      headerLeft={
        <button
          onClick={() => navigate("/")}
          className="text-xs text-foreground/50 hover:text-foreground/80 transition-colors"
        >
          ← Back
        </button>
      }
      headerRight={
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={13} /> Delete
        </button>
      }
    >
      {/* ── HERO ── */}
      <div className="rounded-xl p-5 mb-5 flex items-center gap-4 bg-primary-lighter">
        <CompanyAvatar company={app.company} size="lg" />
        <div className="flex-1 min-w-0">
          <InlineEdit
            display={
              <h1 className="text-xl font-medium text-foreground leading-tight mb-0.5">
                {app.role}
              </h1>
            }
            value={roleDraft}
            onChange={setRoleDraft}
            onSave={() => handleFieldSave("role", roleDraft)}
            placeholder="Job role"
          />
          <InlineEdit
            display={
              <p className="text-[14px] font-medium text-foreground/50">
                {app.company}
              </p>
            }
            value={companyDraft}
            onChange={setCompanyDraft}
            onSave={() => handleFieldSave("company", companyDraft)}
            placeholder="Company name"
          />
          <InlineEdit
            display={
              app.location ? (
                <p className="text-xs text-foreground/50 flex items-center ">
                  <MapPin size={13} className="inline -mt-0.5 mr-1" />
                  {app.location}
                </p>
              ) : (
                <p className="text-xs text-foreground/30 italic">
                  Add location…
                </p>
              )
            }
            value={locationDraft}
            onChange={setLocationDraft}
            onSave={() => handleFieldSave("location", locationDraft)}
            placeholder="Area, City"
          />
        </div>
        <StatusPill status={app.status} />
      </div>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div className="grid grid-cols-[1fr_300px] gap-5">
        {/* ── LEFT COLUMN */}
        <div className="flex flex-col gap-4">
          {/* Status + Work Setup */}
          <div className="grid grid-cols-2 gap-4">
            <MetaCard label="Status">
              <select
                value={app.status}
                onChange={(e) => handleStatusChange(e.target.value as Status)}
                className="w-full bg-background border border-shadow rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:border-primary-darker/50 appearance-none"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </MetaCard>

            <MetaCard label="Work Setup">
              <select
                value={app.workSetup ?? ""}
                onChange={(e) =>
                  handleWorkSetupChange(
                    (e.target.value || null) as WorkSetup | null,
                  )
                }
                className="w-full bg-background border border-shadow rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:border-primary-darker/50 appearance-none"
              >
                <option value="">Not specified</option>
                {WORK_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </MetaCard>
          </div>

          {/* Tags + Job Posting URL */}
          <div className="grid grid-cols-2 gap-4">
            <MetaCard label="Tags">
              <TagInput
                value={app.tags.map(({ name, color }) => ({ name, color }))}
                onChange={async (tags) => {
                  const updated = await update(app.id, { tags });
                  setApp(updated);
                }}
              />
            </MetaCard>

            <MetaCard label="Job Posting URL">
              <InlineEdit
                display={
                  app.url ? (
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-darker hover:underline truncate block"
                    >
                      {app.url.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    <p className="text-xs text-foreground/30 italic">
                      No link saved
                    </p>
                  )
                }
                value={app.url ?? ""}
                onChange={(v) => setApp((p) => (p ? { ...p, url: v } : p))}
                onSave={() => handleFieldSave("url", app.url)}
                placeholder="https://..."
              />
            </MetaCard>
          </div>

          {/* Job Description */}
          <MetaCard label="Job Description">
            <InlineEdit
              display={
                jobDescDraft ? (
                  <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap">
                    {jobDescDraft}
                  </p>
                ) : (
                  <p className="text-xs text-foreground/30 italic">
                    Paste the job description here…
                  </p>
                )
              }
              value={jobDescDraft}
              onChange={setJobDescDraft}
              onSave={() => handleFieldSave("jobDescription", jobDescDraft)}
              multiline
              placeholder="Paste the full job description…"
            />
          </MetaCard>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex flex-col gap-4">
          {/* Application Timeline */}
          <div className="bg-white rounded-lg border border-shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/40">
                Application Timeline
              </h3>
            </div>

            {app.statusHistory.length === 0 ? (
              <p className="text-xs text-foreground/30 italic">
                No updates yet.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {[...app.statusHistory].reverse().map((h) => {
                  const toCfg = STATUS_STYLES[h.to];
                  const date = new Date(h.changedAt);
                  const dayOfMonth = date.getDate();

                  return (
                    <div key={h.id} className="flex items-start gap-3">
                      {/* Circle with date */}
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5"
                        style={{ backgroundColor: toCfg.bg, color: toCfg.fg }}
                      >
                        {dayOfMonth}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          {STATUS_LABELS[h.to]}
                        </p>
                        <p className="text-xs text-foreground/40">
                          {date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <MetaCard label="Company Notes">
            <InlineEdit
              display={
                app.companyNotes ? (
                  <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap">
                    {app.companyNotes}
                  </p>
                ) : (
                  <p className="text-xs text-foreground/30 italic">
                    Notes about this company…
                  </p>
                )
              }
              value={companyNotesDraft}
              onChange={setCompanyNotesDraft}
              onSave={() => handleFieldSave("companyNotes", companyNotesDraft)}
              multiline
              placeholder="Add notes about this company..."
            />
          </MetaCard>

          <MetaCard label="Application Notes">
            <InlineEdit
              display={
                notesDraft ? (
                  <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap">
                    {notesDraft}
                  </p>
                ) : (
                  <p className="text-xs text-foreground/30 italic">
                    No notes yet. Hover to edit.
                  </p>
                )
              }
              value={notesDraft}
              onChange={setNotesDraft}
              onSave={() => handleFieldSave("notes", notesDraft)}
              multiline
              placeholder="Add notes about this application…"
            />
          </MetaCard>
        </div>
      </div>
    </AppShell>
  );
}
