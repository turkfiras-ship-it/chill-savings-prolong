import { ReactNode, useEffect } from "react";
import {
  Save,
  Eye,
  EyeOff,
  Globe,
  Pencil,
  Lock,
  Zap,
  Undo2,
  Redo2,
} from "lucide-react";
import { useEditor, BlockDef } from "@/context/EditorContext";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";
import { cn } from "@/lib/utils";

interface EditorShellProps {
  children: ReactNode;
  blocks: BlockDef[];
}

export function EditorShell({ children, blocks }: EditorShellProps) {
  const {
    isEditorMode,
    toggleEditorMode,
    isPreviewMode,
    setPreviewMode,
    saveLayout,
    publishLayout,
    isSaving,
    isPublishing,
    lastSaved,
    selectBlock,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditor();

  const showPanels = isEditorMode && !isPreviewMode;

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isEditorMode) return;
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
      if (e.key === "s") {
        e.preventDefault();
        saveLayout();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isEditorMode, undo, redo, saveLayout]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <div className="h-11 shrink-0 border-b bg-card flex items-center justify-between px-3 z-50 shadow-sm">
        {/* Left group */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-1">
            <Zap className="h-4 w-4 text-savings" />
            <span className="text-sm font-semibold hidden sm:block">Jarir Report</span>
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Edit layout toggle */}
          <button
            onClick={toggleEditorMode}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
              isEditorMode
                ? "bg-amber-500 text-white hover:bg-amber-600"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
            )}
          >
            {isEditorMode ? (
              <><Lock className="h-3 w-3" />Exit Editor</>
            ) : (
              <><Pencil className="h-3 w-3" />Edit Layout</>
            )}
          </button>

          {/* Undo / Redo — only in editor mode */}
          {isEditorMode && (
            <>
              <div className="h-4 w-px bg-border" />
              <button
                onClick={undo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
                className="p-1.5 rounded-md hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Undo2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
                className="p-1.5 rounded-md hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Redo2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Right group */}
        <div className="flex items-center gap-1.5">
          {lastSaved && (
            <span className="text-[11px] text-muted-foreground hidden lg:block mr-2">
              Saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}

          {isEditorMode && (
            <button
              onClick={() => setPreviewMode(!isPreviewMode)}
              title={isPreviewMode ? "Back to edit mode" : "Preview without editor UI"}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-input bg-background hover:bg-secondary transition-colors"
            >
              {isPreviewMode ? (
                <><EyeOff className="h-3 w-3" />Back to Edit</>
              ) : (
                <><Eye className="h-3 w-3" />Preview</>
              )}
            </button>
          )}

          <button
            onClick={saveLayout}
            disabled={isSaving}
            title="Save layout (Ctrl+S)"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-input bg-background hover:bg-secondary transition-colors disabled:opacity-60"
          >
            <Save className="h-3 w-3" />
            {isSaving ? "Saving…" : "Save"}
          </button>

          <button
            onClick={publishLayout}
            disabled={isPublishing}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-savings text-white hover:bg-savings/90 transition-colors disabled:opacity-60"
          >
            <Globe className="h-3 w-3" />
            {isPublishing ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>

      {/* ── Main area ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        {showPanels && (
          <div className="w-52 shrink-0 border-r bg-card overflow-y-auto">
            <LeftPanel blocks={blocks} />
          </div>
        )}

        {/* Canvas */}
        <div
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden relative",
            showPanels && "bg-muted/20"
          )}
          onClick={() => isEditorMode && selectBlock(null)}
        >
          {/* Canvas hint bar */}
          {showPanels && (
            <div className="sticky top-0 z-40 py-1.5 bg-muted/80 border-b backdrop-blur-sm text-center text-[10px] text-muted-foreground font-medium uppercase tracking-widest select-none pointer-events-none">
              Canvas · click to select · drag ⠿ handle to reorder · double-click text to edit
            </div>
          )}
          {children}
        </div>

        {/* Right panel */}
        {showPanels && (
          <div className="w-60 shrink-0 border-l bg-card overflow-y-auto">
            <RightPanel />
          </div>
        )}
      </div>
    </div>
  );
}
