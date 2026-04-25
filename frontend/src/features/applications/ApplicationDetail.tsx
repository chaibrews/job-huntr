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
import TagEditor from "../../components/TagEditor";

const WORK_OPTIONS: { value: WorkSetup; label: string }[] = [
  { value: "ONSITE", label: "On-site" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "REMOTE", label: "Remote" },
];

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { changeStatus, update, remove } = useApplications();

  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Draft fields for inline editing
  const [notesDraft, setNotesDraft] = useState("");
  const [companyDraft, setCompanyDraft] = useState("");
  const [roleDraft, setRoleDraft] = useState("");
  const [locationDraft, setLocationDraft] = useState("");
  const [jobDescDraft, setJobDescDraft] = useState("");

  useEffect(() => {
    if (!id) return;
    getApplicationById(id)
      .then((data) => {
        setApp(data);
        setNotesDraft(data.notes ?? "");
        setCompanyDraft(data.company);
        setRoleDraft(data.role);
        setLocationDraft(data.location ?? "");
        setJobDescDraft((data as any).jobDescription ?? "");
      })
      .catch(() => setError("Application not found"))
      .finally(() => setLoading(false));
  }, [id]);

  // ── handlers ──────────────────────────────────────────

  async function handleStatusChange(status: Status) {
    if (!app) return;
    setApp((p) => (p ? { ...p, status } : p)); // optimistic
    try {
      const updated = await changeStatus(app.id, status);
      setApp(updated);
    } catch {
      setApp(app); // rollback
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
    const updated = await update(app.id, { [field]: value || null });
    setApp(updated);
    // Sync drafts with server response
    if (field === "company") setCompanyDraft(updated.company);
    if (field === "role") setRoleDraft(updated.role);
    if (field === "location") setLocationDraft(updated.location ?? "");
  }

  async function handleDelete() {
    if (!app || !confirm(`Delete application to ${app.company}?`)) return;
    await remove(app.id);
    navigate("/");
  }

  // ── render states ──────────────────────────────────────

  if (loading)
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-primary animate-pulse">Loading…</p>
        </div>
      </AppShell>
    );

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

  const statusStyle = STATUS_STYLES[app.status];

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
              <p className="text-xs text-foreground/50 mb-0.5">{app.company}</p>
            }
            value={companyDraft}
            onChange={setCompanyDraft}
            onSave={() => handleFieldSave("company", companyDraft)}
            placeholder="Company name"
          />
          <InlineEdit
            display={
              <h1 className="text-xl font-semibold text-foreground leading-tight">
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
              app.location ? (
                <p className="text-sm text-foreground/50 flex items-center gap-1 mt-1">
                  <MapPin size={13} />
                  {app.location}
                </p>
              ) : (
                <p className="text-sm text-foreground/30 italic mt-1">
                  Add location…
                </p>
              )
            }
            value={locationDraft}
            onChange={setLocationDraft}
            onSave={() => handleFieldSave("location", locationDraft)}
            placeholder="City, Country"
          />
        </div>
        <StatusPill status={app.status} />
      </div>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div className="grid grid-cols-[1fr_300px] gap-5">
        {/* ── LEFT COLUMN — meta fields ── */}
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

          {/* Tags + Job Posting */}
          <div className="grid grid-cols-2 gap-4">
            <MetaCard label="Tags">
              <TagEditor
                applicationId={app.id}
                attachedTags={app.tags}
                onUpdate={(tags) => setApp((p) => (p ? { ...p, tags } : p))}
              />
            </MetaCard>

            <MetaCard label="Job Posting">
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
                    <p className="text-sm text-foreground/30 italic">
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
                  <p className="text-sm text-foreground/30 italic">
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

        {/* ── RIGHT COLUMN — timeline, docs, notes ── */}
        <div className="flex flex-col gap-4">
          {/* Application Timeline */}
          <div className="bg-white rounded-xl border border-shadow p-4">
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
                {[...app.statusHistory].reverse().map((h, i) => {
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

          {/* Application Notes */}
          <div className="bg-white rounded-xl border border-shadow p-4 flex-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-3">
              Application Notes
            </h3>
            <InlineEdit
              display={
                app.notes ? (
                  <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap">
                    {app.notes}
                  </p>
                ) : (
                  <p className="text-sm text-foreground/30 italic">
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
          </div>

          {/* Documents (placeholder) */}
          {/* <div className="bg-white rounded-xl border border-shadow p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-3">
              Documents
            </h3>
            <div className="flex flex-col gap-2">
              {["Resume", "Cover Letter"].map((doc) => (
                <button
                  key={doc}
                  className="flex items-center gap-2.5 text-xs text-foreground/50
                             hover:text-primary-darker transition-colors py-1"
                >
                  <FileText size={14} className="text-primary/60" />
                  <span className="font-medium uppercase tracking-wider">
                    {doc}
                  </span>
                </button>
              ))}
            </div>
          </div> */}
        </div>
      </div>
    </AppShell>
  );
}
