import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BlockStyle {
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  marginTop?: string;
  marginBottom?: string;
  backgroundColor?: string;
  opacity?: string;
  borderRadius?: string;
  textAlign?: "left" | "center" | "right";
}

export interface BlockDef {
  id: string;
  label: string;
  style: BlockStyle;
}

interface EditorContextValue {
  isEditorMode: boolean;
  toggleEditorMode: () => void;
  isPreviewMode: boolean;
  setPreviewMode: (v: boolean) => void;
  selectedId: string | null;
  selectBlock: (id: string | null) => void;
  blocks: BlockDef[];
  getBlockStyle: (id: string) => BlockStyle;
  updateBlockStyle: (id: string, updates: Partial<BlockStyle>) => void;
  resetBlockStyle: (id: string) => void;
  saveLayout: () => Promise<void>;
  publishLayout: () => Promise<void>;
  isSaving: boolean;
  isPublishing: boolean;
  lastSaved: Date | null;
}

const EditorContext = createContext<EditorContextValue | null>(null);

const LAYOUT_NAME = "jarir-report-layout";

// ─── Provider ─────────────────────────────────────────────────────────────────

export function EditorProvider({ children, defaultBlocks }: { children: ReactNode; defaultBlocks: BlockDef[] }) {
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<BlockDef[]>(defaultBlocks);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load saved styles from DB on mount
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("page_layouts")
          .select("layout_json")
          .eq("name", LAYOUT_NAME)
          .maybeSingle();

        if (data?.layout_json && Array.isArray(data.layout_json)) {
          const saved = data.layout_json as unknown as BlockDef[];
          setBlocks(prev =>
            prev.map(def => {
              const savedBlock = saved.find(b => b.id === def.id);
              return savedBlock ? { ...def, style: savedBlock.style ?? {} } : def;
            })
          );
        }
      } catch (e) {
        console.warn("Could not load layout:", e);
      }
    })();
  }, []);

  const saveLayout = useCallback(async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: LAYOUT_NAME,
        layout_json: blocks as unknown as import("@/integrations/supabase/types").Json,
        status: "draft",
        updated_at: new Date().toISOString(),
      };
      await (supabase.from("page_layouts") as any).upsert(payload, { onConflict: "name" });
      setLastSaved(new Date());
    } catch (e) {
      console.error("Save failed:", e);
    } finally {
      setIsSaving(false);
    }
  }, [blocks]);

  const publishLayout = useCallback(async () => {
    setIsPublishing(true);
    try {
      const payload = {
        name: LAYOUT_NAME,
        layout_json: blocks as unknown as import("@/integrations/supabase/types").Json,
        status: "published",
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await (supabase.from("page_layouts") as any).upsert(payload, { onConflict: "name" });
      setLastSaved(new Date());
    } catch (e) {
      console.error("Publish failed:", e);
    } finally {
      setIsPublishing(false);
    }
  }, [blocks]);

  const getBlockStyle = useCallback(
    (id: string): BlockStyle => blocks.find(b => b.id === id)?.style ?? {},
    [blocks]
  );

  const updateBlockStyle = useCallback((id: string, updates: Partial<BlockStyle>) => {
    setBlocks(prev =>
      prev.map(b => (b.id === id ? { ...b, style: { ...b.style, ...updates } } : b))
    );
  }, []);

  const resetBlockStyle = useCallback((id: string) => {
    setBlocks(prev => prev.map(b => (b.id === id ? { ...b, style: {} } : b)));
  }, []);

  const toggleEditorMode = useCallback(() => {
    setIsEditorMode(v => !v);
    setSelectedId(null);
  }, []);

  return (
    <EditorContext.Provider
      value={{
        isEditorMode,
        toggleEditorMode,
        isPreviewMode,
        setPreviewMode: setIsPreviewMode,
        selectedId,
        selectBlock: setSelectedId,
        blocks,
        getBlockStyle,
        updateBlockStyle,
        resetBlockStyle,
        saveLayout,
        publishLayout,
        isSaving,
        isPublishing,
        lastSaved,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within EditorProvider");
  return ctx;
}
