import { ReactNode, CSSProperties } from "react";
import { useEditor, BlockStyle } from "@/context/EditorContext";
import { cn } from "@/lib/utils";

interface SelectableBlockProps {
  blockId: string;
  label: string;
  children: ReactNode;
  className?: string;
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

export function SelectableBlock({ blockId, label, children, className }: SelectableBlockProps) {
  const { isEditorMode, isPreviewMode, selectedId, selectBlock, getBlockStyle } = useEditor();
  const isSelected = selectedId === blockId;
  const appliedStyle = styleToCSS(getBlockStyle(blockId));

  // Non-editor or preview: render normally with any saved custom styles
  if (!isEditorMode || isPreviewMode) {
    return (
      <div className={className} style={appliedStyle}>
        {children}
      </div>
    );
  }

  return (
    <div
      style={appliedStyle}
      onClick={(e) => {
        e.stopPropagation();
        selectBlock(blockId);
      }}
      className={cn(
        "relative group/block transition-all duration-100 cursor-pointer",
        isSelected
          ? "ring-2 ring-primary ring-offset-0"
          : "hover:ring-2 hover:ring-primary/40",
        className
      )}
    >
      {/* Block label badge */}
      <div
        className={cn(
          "absolute top-0 left-0 z-[100] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-br-md pointer-events-none transition-opacity",
          isSelected
            ? "bg-primary text-primary-foreground opacity-100"
            : "bg-primary/70 text-primary-foreground opacity-0 group-hover/block:opacity-100"
        )}
      >
        {label}
      </div>

      {children}
    </div>
  );
}
