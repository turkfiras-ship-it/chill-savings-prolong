import { useState, useRef, useEffect, ElementType } from "react";
import { useEditor } from "@/context/EditorContext";
import { cn } from "@/lib/utils";

interface EditableTextProps {
  textKey: string;
  defaultValue: string;
  as?: ElementType;
  className?: string;
  [key: string]: unknown;
}

export function EditableText({
  textKey,
  defaultValue,
  as: Tag = "span",
  className,
  ...rest
}: EditableTextProps) {
  const { isEditorMode, isPreviewMode, getText, updateText } = useEditor();
  const [isEditing, setIsEditing] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const value = getText(textKey, defaultValue);

  useEffect(() => {
    if (isEditing && ref.current) {
      ref.current.focus();
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  if (!isEditorMode || isPreviewMode) {
    return (
      <Tag className={className} {...rest}>
        {value}
      </Tag>
    );
  }

  if (isEditing) {
    return (
      <Tag
        ref={ref as any}
        contentEditable
        suppressContentEditableWarning
        className={cn(
          className,
          "outline-none ring-2 ring-primary ring-offset-1 rounded-sm cursor-text"
        )}
        onBlur={(e: React.FocusEvent<HTMLElement>) => {
          const newVal = e.currentTarget.textContent ?? value;
          updateText(textKey, newVal);
          setIsEditing(false);
        }}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Escape") {
            setIsEditing(false);
          }
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            (e.currentTarget as HTMLElement).blur();
          }
        }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        {...rest}
      >
        {value}
      </Tag>
    );
  }

  return (
    <Tag
      className={cn(className, "cursor-text group/editable-text relative")}
      onDoubleClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      title="Double-click to edit text"
      {...rest}
    >
      {value}
      {/* Subtle edit indicator */}
      <span className="absolute -top-4 left-0 text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-medium opacity-0 group-hover/editable-text:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        double-click to edit
      </span>
    </Tag>
  );
}
