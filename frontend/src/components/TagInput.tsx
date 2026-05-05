// Reusable autocomplete pill input component for tags

import { useEffect, useRef, useState } from "react";
import type { Tag } from "../types";
import type { TagInput as TagInputType } from "../api/applications";
import { getUserTags } from "../api/applications";

const TAG_COLORS = ["#6D83DD", "#E07B54", "#54A98B", "#C46DB5", "#D4A84B"];
const randomColor = () =>
  TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];

interface Props {
  value: TagInputType[];
  onChange: (tags: TagInputType[]) => void;
  className?: string;
}

export default function TagInput({ value, onChange, className }: Props) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getUserTags()
      .then(setAllTags)
      .catch(() => {});
  }, []);
  const suggestions = allTags.filter(
    (t) =>
      input.length > 0 &&
      t.name.toLowerCase().startsWith(input.toLowerCase()) && // prefix match
      !value.some((v) => v.name.toLowerCase() === t.name.toLowerCase()),
  );

  function add(name: string, color: string) {
    const trimmed = name.trim();
    if (
      !trimmed ||
      value.some((t) => t.name.toLowerCase() === trimmed.toLowerCase())
    )
      return;
    onChange([...value, { name: trimmed, color }]);
    setInput("");
    setOpen(false);
  }

  function remove(name: string) {
    onChange(value.filter((t) => t.name !== name));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      if (suggestions.length > 0) {
        add(suggestions[0].name, suggestions[0].color);
      } else {
        add(input.trim(), randomColor());
      }
    }
    if (e.key === "Backspace" && !input) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div
      className={`flex flex-wrap gap-1.5 bg-background border border-shadow rounded-lg px-3 py-2 min-h-[38px] cursor-text ${className || ""}`}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((t) => (
        <span
          key={t.name}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
          style={{ backgroundColor: t.color + "22", color: t.color }}
        >
          {t.name}
          <button
            type="button"
            onClick={() => remove(t.name)}
            className="hover:opacity-60"
          >
            ×
          </button>
        </span>
      ))}

      <div className="relative flex-1 min-w-[100px]">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={value.length === 0 ? "Add tags…" : ""}
          className="w-full bg-transparent text-sm focus:outline-none placeholder:text-foreground/30"
        />

        {open && (input || suggestions.length > 0) && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-shadow rounded-lg shadow-lg z-10 overflow-hidden">
            {suggestions.length > 0
              ? suggestions.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onMouseDown={() => add(t.name, t.color)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-background text-left"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: t.color }}
                    />
                    {t.name}
                  </button>
                ))
              : input.trim() && (
                  <button
                    type="button"
                    onMouseDown={() => add(input.trim(), randomColor())}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-background text-left text-foreground/50"
                  >
                    <span className="text-primary-darker font-medium">+</span>
                    Create "{input.trim()}"
                  </button>
                )}
          </div>
        )}
      </div>
    </div>
  );
}
