import { useState } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSelect?: (v: string) => void;
  required?: boolean;
  suggestions: string[];
  placeholder?: string;
  className?: string;
}

export default function Autocomplete({
  value,
  onChange,
  onSelect,
  suggestions,
  placeholder,
  className,
  required,
}: Props) {
  const [open, setOpen] = useState(false);
  const filtered = suggestions.filter(
    (s) =>
      value.length > 0 &&
      s.toLowerCase().startsWith(value.trim().toLowerCase()) &&
      s.toLowerCase() !== value.toLowerCase(),
  );

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className={className}
        required={required}
      />
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-shadow rounded-lg shadow-lg z-10 overflow-hidden">
          {filtered.slice(0, 6).map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={() => {
                onChange(s);
                onSelect?.(s);
                setOpen(false);
              }}
              className="w-full px-3 py-2 text-sm hover:bg-background text-left truncate"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
