"use client";

import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-border bg-background/70 px-3 py-2 text-sm text-foreground placeholder:text-dim focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent";

export function Field({
  label,
  value,
  onChange,
  multiline,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-body">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`${inputClass} resize-y`}
        />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} />
      )}
      {hint && <span className="mt-1 block text-xs text-dim">{hint}</span>}
    </label>
  );
}

/** Move/delete buttons shared by every list item. */
export function RowControls({
  index,
  count,
  onMove,
  onDelete,
  label,
}: {
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onDelete: (index: number) => void;
  label: string;
}) {
  const btn = "grid h-8 w-8 place-items-center rounded-md border border-border text-body hover:text-foreground hover:border-accent/50 disabled:opacity-30 disabled:pointer-events-none";
  return (
    <div className="flex shrink-0 gap-1.5">
      <button type="button" className={btn} disabled={index === 0} onClick={() => onMove(index, index - 1)} aria-label={`Move ${label} up`}>
        <ArrowUp className="w-3.5 h-3.5" />
      </button>
      <button type="button" className={btn} disabled={index === count - 1} onClick={() => onMove(index, index + 1)} aria-label={`Move ${label} down`}>
        <ArrowDown className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        className={`${btn} hover:!text-red-400 hover:!border-red-400/50`}
        onClick={() => {
          if (confirm(`Delete this ${label}?`)) onDelete(index);
        }}
        aria-label={`Delete ${label}`}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-accent/40 px-3 py-2 text-sm text-accent hover:bg-accent/10"
    >
      <Plus className="w-4 h-4" /> {children}
    </button>
  );
}

/** Ordered list of free-text lines (bullet points, flow steps). */
export function LineList({
  label,
  items,
  onChange,
  multiline,
  addLabel,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  multiline?: boolean;
  addLabel: string;
}) {
  const move = (from: number, to: number) => onChange(moveItem(items, from, to));
  return (
    <div>
      <span className="mb-1.5 block text-xs font-medium text-body">{label}</span>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            {multiline ? (
              <textarea
                value={item}
                rows={2}
                onChange={(e) => onChange(items.map((v, j) => (j === i ? e.target.value : v)))}
                className={`${inputClass} resize-y`}
              />
            ) : (
              <input
                value={item}
                onChange={(e) => onChange(items.map((v, j) => (j === i ? e.target.value : v)))}
                className={inputClass}
              />
            )}
            <RowControls index={i} count={items.length} onMove={move} onDelete={(j) => onChange(items.filter((_, k) => k !== j))} label="line" />
          </div>
        ))}
        <AddButton onClick={() => onChange([...items, ""])}>{addLabel}</AddButton>
      </div>
    </div>
  );
}

/** Tag-style editor: type and press Enter (or comma) to add; × to remove. */
export function ChipInput({ label, items, onChange }: { label: string; items: string[]; onChange: (items: string[]) => void }) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const value = draft.trim();
    if (value && !items.includes(value)) onChange([...items, value]);
    setDraft("");
  };

  return (
    <div>
      <span className="mb-1.5 block text-xs font-medium text-body">{label}</span>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background/70 p-2 focus-within:border-accent">
        {items.map((item, i) => (
          <span key={item} className="inline-flex items-center gap-1 rounded-md border border-accent/30 bg-accent/10 py-1 pl-2.5 pr-1 text-xs text-foreground">
            {item}
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              aria-label={`Remove ${item}`}
              className="grid h-5 w-5 place-items-center rounded text-body hover:text-red-400"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
            } else if (e.key === "Backspace" && !draft && items.length) {
              onChange(items.slice(0, -1));
            }
          }}
          onBlur={commit}
          placeholder="Type and press Enter"
          className="min-w-[10rem] flex-1 bg-transparent px-1 py-1 text-sm text-foreground placeholder:text-dim focus:outline-none"
        />
      </div>
    </div>
  );
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
