import { ReactNode } from "react";
import { Save, Eye, EyeOff, Globe, Pencil, Lock, Zap } from "lucide-react";
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
  } = useEditor();

  const showPanels = isEditorMode && !isPreviewMode;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* ── Top Bar ──────────────────────────────────────────────────── */}
      <div className="h-11 shrink-0 border-b bg-card flex items-center justify-between px-3 z-50 shadow-sm">
        {/* Left: branding + edit toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-savings" />
            <span className="text-sm font-semibold hidden sm:block">Jarir Report</span>
          </div>

          <div className="h-4 w-px bg-border" />

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
              <>
                <Lock className="h-3 w-3" />
                Exit Editor
              </>
            ) : (
              <>
                <Pencil className="h-3 w-3" />
                Edit Layout
              </>
            )}
          </button>
        </div>

        {/* Right: save / preview / publish */}
        <div className="flex items-center gap-1.5">
          {lastSaved && (
            <span className="text-[11px] text-muted-foreground hidden md:block mr-2">
              Saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}

          {/* Preview toggle — only in editor mode */}
          {isEditorMode && (
            <button
              onClick={() => setPreviewMode(!isPreviewMode)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-input bg-background hover:bg-secondary transition-colors"
            >
              {isPreviewMode ? (
                <>
                  <EyeOff className="h-3 w-3" />
                  Back to Edit
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3" />
                  Preview
                </>
              )}
            </button>
          )}

          <button
            onClick={saveLayout}
            disabled={isSaving}
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

      {/* ── Main area ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        {showPanels && (
          <div className="w-52 shrink-0 border-r bg-card overflow-y-auto">
            <LeftPanel blocks={blocks} />
          </div>
        )}

        {/* Canvas */}
        <div
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden relative",
            isEditorMode && !isPreviewMode && "bg-muted/30"
          )}
          onClick={() => isEditorMode && selectBlock(null)}
        >
          {/* Canvas frame indicator in edit mode */}
          {isEditorMode && !isPreviewMode && (
            <div className="sticky top-0 z-40 flex items-center justify-center py-1.5 bg-muted/80 border-b text-[10px] text-muted-foreground font-medium uppercase tracking-widest backdrop-blur-sm select-none">
              Canvas — click a section to select it
            </div>
          )}
          {children}
        </div>

        {/* Right Panel */}
        {showPanels && (
          <div className="w-60 shrink-0 border-l bg-card overflow-y-auto">
            <RightPanel />
          </div>
        )}
      </div>
    </div>
  );
}
