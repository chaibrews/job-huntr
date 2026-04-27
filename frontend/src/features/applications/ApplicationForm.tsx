// Modal form for creating a new application.
// Kept as a modal (not a page) so users can add from anywhere in the app.

import { useState, type FormEvent } from "react";
import type { CreateApplicationInput } from "../../api/applications";
import type { Status, WorkSetup } from "../../types";

interface Props {
  onClose: () => void;
  onCreate: (data: CreateApplicationInput) => Promise<void>;
  defaultStatus?: Status;
}

const STATUS_OPTIONS: Status[] = [
  "SAVED",
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
];

const WORK_OPTIONS: { value: WorkSetup; label: string }[] = [
  { value: "ONSITE", label: "On-site" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "REMOTE", label: "Remote" },
];

// Reusable labeled input row — local to this file since it's form-specific
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs uppercase tracking-wider text-foreground/50">
        {label}
        {required && <span className="text-primary-darker ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "bg-background border border-shadow rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-darker/50 focus:bg-white transition-colors";

export default function ApplicationForm({
  onClose,
  onCreate,
  defaultStatus = "SAVED",
}: Props) {
  const [status, setStatus] = useState<Status>(defaultStatus);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [workSetup, setWorkSetup] = useState<WorkSetup | "">("");
  const [location, setLocation] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  // const [description, setDescription] = useState("");
  const [appliedAt, setAppliedAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onCreate({
        company,
        role,
        status,
        workSetup: (workSetup || null) as WorkSetup | null,
        location: location || null,
        url: url || null,
        notes: notes || null,
        appliedAt: appliedAt || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-shadow overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-shadow">
          <div>
            <h2 className="text-base text-foreground">New Application</h2>
            <p className="text-xs text-foreground/40 mt-0.5">
              Track a new job you're interested in
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center
                       text-foreground/40 hover:text-foreground/70 hover:bg-background
                       transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company" required>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                placeholder="e.g. Google"
                className={inputClass}
              />
            </Field>
            <Field label="Role" required>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                placeholder="e.g. Software Engineer"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Location">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote, Makati"
                className={inputClass}
              />
            </Field>
            <Field label="Work Setup">
              <select
                value={workSetup}
                onChange={(e) => setWorkSetup(e.target.value as WorkSetup)}
                className={`${inputClass} appearance-none`}
              >
                <option value="">Not specified</option>
                {WORK_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div
            className={`grid gap-3 ${status !== "SAVED" ? "grid-cols-2" : "grid-cols-1"}`}
          >
            <Field label="Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className={`${inputClass} appearance-none`}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </Field>

            {/* Only show Applied Date when status is not SAVED */}
            {status !== "SAVED" && (
              <Field label="Applied Date">
                <input
                  type="date"
                  value={appliedAt}
                  onChange={(e) => setAppliedAt(e.target.value)}
                  className={inputClass}
                />
              </Field>
            )}
          </div>

          <Field label="Job Posting URL">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </Field>
          {/* 
          <Field label="Job Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Paste the job description or key details here for easy reference."
              className={`${inputClass} resize-none leading-relaxed`}
            />
          </Field> */}

          <Field label="Application Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Recruiter contact, referral info, anything relevant…"
              className={`${inputClass} resize-none leading-relaxed`}
            />
          </Field>

          {error && (
            <p className="text-xs text-red-400 bg-red-50 rounded-lg px-3 py-2 border border-red-100">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-shadow text-sm font-medium
                         text-foreground/60 hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 primary-button py-2 text-sm"
            >
              {loading ? "Adding…" : "Add Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
