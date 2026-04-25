import { useState, useEffect, useRef } from "react";
import type { Tag } from "../types";
import {
  getUserTags,
  createTag,
  attachTag,
  deleteTag,
  detachTag,
} from "../api/applications";
import { Delete, Link2, Link2Off } from "lucide-react";

const TAG_COLORS = [
  "#6D83DD",
  "#806ed3",
  "#A2C4B2",
  "#AFAEC4",
  "#f0a8b0",
  "#f0c980",
];

interface Props {
  applicationId: string;
  attachedTags: Tag[];
  onUpdate: (updated: Tag[]) => void;
}

export default function TagEditor({
  applicationId,
  attachedTags,
  onUpdate,
}: Props) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [open, setOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tagColor, setTagColor] = useState(TAG_COLORS[0]);

  useEffect(() => {
    getUserTags()
      .then(setAllTags)
      .catch(() => {});
  }, []);

  const attachedIds = new Set(attachedTags.map((t) => t.id));
  const unattached = allTags.filter((t) => !attachedIds.has(t.id));
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleAttach(tag: Tag) {
    const updated = await attachTag(applicationId, tag.id);
    onUpdate(updated.tags);
  }

  async function handleDetach(tagId: string) {
    const updated = await detachTag(applicationId, tagId);
    onUpdate(updated.tags);
  }

  async function handleCreate() {
    const name = tagInput.trim().replace(/^#/, "");
    if (!name) return;
    const tag = await createTag(name, tagColor);
    setAllTags((prev) => [...prev, tag]);
    const updated = await attachTag(applicationId, tag.id);
    onUpdate(updated.tags);
    setTagInput("");
    setOpen(false);
  }

  async function handleDeleteTag(tagId: string) {
    if (
      !confirm(
        "Delete this tag permanently? It will be removed from all applications.",
      )
    )
      return;
    await deleteTag(tagId); // call the API
    setAllTags((prev) => prev.filter((t) => t.id !== tagId));
    // If it was attached, also remove from local attached list
    if (attachedIds.has(tagId)) {
      onUpdate(attachedTags.filter((t) => t.id !== tagId));
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Attached tags */}
      <div className="flex flex-wrap gap-1.5">
        {attachedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
            style={{
              backgroundColor: tag.color + "22",
              color: tag.color,
              border: `1px solid ${tag.color}55`,
            }}
          >
            #{tag.name}
            <button
              onClick={() => handleDetach(tag.id)}
              className="hover:opacity-60 leading-none ml-0.5"
            >
              ×
            </button>
          </span>
        ))}
        <button
          onClick={() => setOpen(!open)}
          className="text-xs px-2.5 py-1 rounded-full border border-dashed border-shadow text-foreground/40 hover:border-primary hover:text-primary transition-colors"
        >
          + tag
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-10 top-full left-0 mt-1 w-56 bg-white border border-shadow rounded-xl shadow-lg p-3">
          {allTags.map((tag) => {
            const isAttached = attachedIds.has(tag.id);
            return (
              <div
                key={tag.id}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-background group"
              >
                <button
                  onClick={() => {
                    if (!isAttached) {
                      handleAttach(tag);
                      setOpen(false);
                    }
                  }}
                  className="flex items-center gap-2 text-xs flex-1 text-left"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  #{tag.name}
                  {isAttached && (
                    <span className="text-foreground/70 font-bold text-xs">
                      <Link2 size={12} />
                    </span>
                  )}
                  {!isAttached && (
                    <span className="text-foreground/30 font-bold text-xs">
                      <Link2Off size={12} />
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleDeleteTag(tag.id)}
                  className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 ml-2"
                  title="Delete tag permanently"
                >
                  <Delete size={12} />
                </button>
              </div>
            );
          })}
          {/* Create new */}
          <div
            className={`${unattached.length > 0 ? "border-t border-shadow mt-2 pt-2" : ""}`}
          >
            <div className="flex gap-2 text-xs mb-1.5">
              <p className="text-foreground">Tags</p>
              <p className=" text-foreground/40">Press Enter to create</p>
            </div>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreate();
                }
              }}
              placeholder="e.g. dream role, nice office"
              className="w-full text-xs bg-background border border-shadow rounded-lg px-2 py-1.5 mb-2 focus:outline-none"
            />
            <div className="flex  gap-1.5 mb-1 ">
              {TAG_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setTagColor(c)}
                  className={`w-3 h-3 rounded-full border-2 transition-all cursor-pointer
                  ${tagColor === c ? "ring-2 ring-offset-1 ring-primary scale-105" : ""}`}
                  style={{
                    backgroundColor: c,
                    borderColor: tagColor === c ? c : "transparent",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
