import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableFieldProps {
  value: number;
  onChange: (val: number) => void;
  isEditMode: boolean;
  format?: (v: number) => string;
  suffix?: string;
  prefix?: string;
  className?: string;
  inputClassName?: string;
  min?: number;
  max?: number;
  step?: number;
}

export function EditableField({
  value,
  onChange,
  isEditMode,
  format,
  suffix = "",
  prefix = "",
  className,
  inputClassName,
  min,
  max,
  step = 1,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // Sync external value changes
  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  const commit = () => {
    const num = parseFloat(draft.replace(/,/g, ""));
    if (!isNaN(num)) onChange(num);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(String(value));
    setEditing(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") cancel();
  };

  const display = format ? format(value) : `${prefix}${value.toLocaleString()}${suffix}`;

  if (!isEditMode) {
    return <span className={className}>{display}</span>;
  }

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1">
        {prefix && <span className="text-xs opacity-60">{prefix}</span>}
        <input
          ref={inputRef}
          type="number"
          value={draft}
          min={min}
          max={max}
          step={step}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKey}
          onBlur={commit}
          className={cn(
            "w-28 rounded border border-primary bg-background px-2 py-0.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary",
            inputClassName
          )}
        />
        {suffix && <span className="text-xs opacity-60">{suffix}</span>}
        <button onClick={commit} className="text-savings hover:opacity-80">
          <Check className="h-3.5 w-3.5" />
        </button>
        <button onClick={cancel} className="text-destructive hover:opacity-80">
          <X className="h-3.5 w-3.5" />
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className={cn(
        "group inline-flex items-center gap-1 rounded px-1 -mx-1 hover:bg-primary/10 transition-colors cursor-text",
        className
      )}
      title="Click to edit"
    >
      <span>{display}</span>
      <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity text-primary shrink-0" />
    </button>
  );
}
