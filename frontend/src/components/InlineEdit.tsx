// components/InlineEdit.tsx
// Toggles between displaying text and an editable input/textarea.
// Eliminates the repeated editXxx / setEditXxx / handleSaveXxx pattern
// that was duplicated across ApplicationDetail for notes, meta fields, etc.

import { useState, type ReactNode } from "react";

interface Props {
  display: ReactNode; // what to show in read mode
  value: string;
  onChange: (v: string) => void;
  onSave: () => Promise<void>;
  multiline?: boolean;
  placeholder?: string;
  inputClassName?: string;
}

export default function InlineEdit({
  display,
  value,
  onChange,
  onSave,
  multiline = false,
  placeholder = "",
  inputClassName = "",
}: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave();
    setSaving(false);
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="group flex items-start justify-between gap-2 min-w-0">
        <div className="flex-1  min-w-0 overflow-hidden">{display}</div>
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-primary-darker transition-opacity shrink-0 hover:underline sm:opacity-0 sm:group-hover:opacity-100"
        >
          Edit
        </button>
      </div>
    );
  }

  const sharedClass = `w-full bg-background border border-shadow rounded-lg px-3 py-2 text-sm
    focus:outline-none focus:border-primary-darker/50 transition-colors ${inputClassName}`;

  return (
    <div className="flex flex-col gap-2">
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          autoFocus
          className={`${sharedClass} resize-none leading-relaxed`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus
          className={sharedClass}
        />
      )}
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => setEditing(false)}
          className="text-xs text-foreground/40 hover:text-foreground/70"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-xs text-primary-darker font-semibold hover:underline disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
