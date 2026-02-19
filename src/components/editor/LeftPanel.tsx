import { useState } from "react";
import { Layers, Square, PanelLeft } from "lucide-react";
import { useEditor, BlockDef } from "@/context/EditorContext";
import { cn } from "@/lib/utils";

interface LeftPanelProps {
  blocks: BlockDef[];
}

const ELEMENT_TYPES = [
  { label: "Section", icon: Square, description: "Full-width content block" },
  { label: "Card", icon: Square, description: "Bordered card container" },
  { label: "Chart", icon: Square, description: "Data visualization" },
  { label: "Table", icon: Square, description: "Data table" },
];

export function LeftPanel({ blocks }: LeftPanelProps) {
  const [tab, setTab] = useState<"layers" | "elements">("layers");
  const { selectedId, selectBlock } = useEditor();

  return (
    <div className="flex flex-col h-full text-sm">
      {/* Tab switcher */}
      <div className="flex border-b shrink-0">
        <button
          onClick={() => setTab("layers")}
          className={cn(
            "flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs font-medium transition-colors",
            tab === "layers"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Layers className="h-3.5 w-3.5" />
          Layers
        </button>
        <button
          onClick={() => setTab("elements")}
          className={cn(
            "flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs font-medium transition-colors",
            tab === "elements"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Square className="h-3.5 w-3.5" />
          Elements
        </button>
      </div>

      {/* Layers tab */}
      {tab === "layers" && (
        <div className="flex-1 overflow-y-auto p-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-2 font-medium">
            Page Blocks
          </p>
          <div className="space-y-0.5">
            {blocks.map((block) => (
              <button
                key={block.id}
                onClick={() => selectBlock(selectedId === block.id ? null : block.id)}
                className={cn(
                  "w-full text-left px-2.5 py-2 rounded-md text-xs flex items-center gap-2 transition-colors",
                  selectedId === block.id
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-secondary"
                )}
              >
                <PanelLeft className="h-3 w-3 opacity-40 shrink-0" />
                <span className="truncate">{block.label}</span>
                {selectedId === block.id && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Elements tab */}
      {tab === "elements" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-3">
            Drag to add
          </p>
          {ELEMENT_TYPES.map((el) => (
            <div
              key={el.label}
              className="border border-dashed rounded-lg p-3 text-center opacity-40 cursor-not-allowed select-none"
            >
              <el.icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs font-medium">{el.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{el.description}</p>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground text-center pt-2">Coming soon</p>
        </div>
      )}
    </div>
  );
}
