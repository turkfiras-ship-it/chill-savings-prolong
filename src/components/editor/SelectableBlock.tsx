import { ReactNode, CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useEditor, BlockStyle } from "@/context/EditorContext";
import { cn } from "@/lib/utils";

interface SelectableBlockProps {
  blockId: string;
  label: string;
  children: ReactNode;
  className?: string;
  /** enable sortable drag handle when in editor mode */
  sortable?: boolean;
}

function styleToCSS(style: BlockStyle): CSSProperties {
  return {
    paddingTop: style.paddingTop || undefined,
    paddingBottom: style.paddingBottom || undefined,
    paddingLeft: style.paddingLeft || undefined,
    paddingRight: style.paddingRight || undefined,
    marginTop: style.marginTop || undefined,
    marginBottom: style.marginBottom || undefined,
    backgroundColor: style.backgroundColor || undefined,
    opacity: style.opacity !== undefined ? Number(style.opacity) : undefined,
    borderRadius: style.borderRadius || undefined,
    textAlign: style.textAlign || undefined,
  };
}

export function SelectableBlock({
  blockId,
  label,
  children,
  className,
  sortable = false,
}: SelectableBlockProps) {
  const { isEditorMode, isPreviewMode, selectedId, selectBlock, getBlockStyle } = useEditor();
  const isSelected = selectedId === blockId;
  const isActive = isEditorMode && !isPreviewMode;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: blockId,
    disabled: !sortable || !isActive,
  });

  const customStyles = styleToCSS(getBlockStyle(blockId));
  const dragStyle: CSSProperties = sortable && isActive
    ? { transform: CSS.Transform.toString(transform), transition }
    : {};

  const combinedStyle: CSSProperties = { ...customStyles, ...dragStyle };

  // Non-editor: just apply saved styles
  if (!isActive) {
    return (
      <div className={className} style={customStyles}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={combinedStyle}
      className={cn(
        "relative group/block transition-[box-shadow] duration-100",
        isDragging && "opacity-40 z-50",
        isSelected ? "ring-2 ring-primary" : "hover:ring-2 hover:ring-primary/40",
        className
      )}
      onClick={(e) => {
        if (isDragging) return;
        e.stopPropagation();
        selectBlock(blockId);
      }}
    >
      {/* Label + drag handle bar (visible on hover/select) */}
      <div
        className={cn(
          "absolute top-0 left-0 z-[100] flex items-center gap-1 px-2 py-0.5 rounded-br-md pointer-events-none",
          "transition-opacity",
          isSelected
            ? "bg-primary text-primary-foreground opacity-100"
            : "bg-primary/70 text-primary-foreground opacity-0 group-hover/block:opacity-100"
        )}
      >
        {sortable && (
          <span
            {...attributes}
            {...listeners}
            className="pointer-events-auto cursor-grab active:cursor-grabbing p-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-3 w-3" />
          </span>
        )}
        <span className="text-[10px] font-bold uppercase tracking-wider select-none">
          {label}
        </span>
      </div>

      {children}
    </div>
  );
}
