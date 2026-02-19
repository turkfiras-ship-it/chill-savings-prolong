import { forwardRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface DraggableSectionProps {
  id: string;
  children: ReactNode;
  isEditMode: boolean;
  label?: string;
}

export function DraggableSection({ id, children, isEditMode, label }: DraggableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!isEditMode) {
    return <>{children}</>;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group rounded-xl transition-all duration-200",
        isDragging && "opacity-50 scale-[0.98] z-50 shadow-2xl",
        isOver && "ring-2 ring-primary ring-offset-2",
        isEditMode && "hover:ring-2 hover:ring-primary/40 hover:ring-offset-1"
      )}
    >
      {/* Drag handle bar */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute -top-3 left-1/2 -translate-x-1/2 z-10",
          "flex items-center gap-2 px-3 py-1 rounded-full",
          "bg-primary text-primary-foreground shadow-md",
          "cursor-grab active:cursor-grabbing",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-150 select-none",
          "text-xs font-medium"
        )}
      >
        <GripVertical className="h-3.5 w-3.5" />
        {label && <span>{label}</span>}
      </div>

      {/* Section outline in edit mode */}
      <div className={cn(
        "absolute inset-0 rounded-xl pointer-events-none border-2 border-dashed border-transparent transition-colors",
        "group-hover:border-primary/30"
      )} />

      {children}
    </div>
  );
}
