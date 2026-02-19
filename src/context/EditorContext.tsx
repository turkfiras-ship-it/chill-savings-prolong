import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { arrayMove } from "@dnd-kit/sortable";

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

interface HistoryEntry {
  blocks: BlockDef[];
  blockOrder: string[];
  texts: Record<string, string>;
}

interface EditorContextValue {
  // Mode
  isEditorMode: boolean;
  toggleEditorMode: () => void;
  isPreviewMode: boolean;
  setPreviewMode: (v: boolean) => void;

  // Selection
  selectedId: string | null;
  selectBlock: (id: string | null) => void;

  // Blocks + styles
  blocks: BlockDef[];
  blockOrder: string[];
  getBlockStyle: (id: string) => BlockStyle;
  updateBlockStyle: (id: string, updates: Partial<BlockStyle>) => void;
  resetBlockStyle: (id: string) => void;
  reorderBlocks: (oldIndex: number, newIndex: number) => void;

  // Inline texts
  texts: Record<string, string>;
  getText: (key: string, defaultValue: string) => string;
  updateText: (key: string, value: string) => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Persistence
  saveLayout: () => Promise<void>;
  publishLayout: () => Promise<void>;
  isSaving: boolean;
  isPublishing: boolean;
  lastSaved: Date | null;
}

const EditorContext = createContext<EditorContextValue | null>(null);

const LAYOUT_NAME = "jarir-report-layout";

// ─── Provider ─────────────────────────────────────────────────────────────────

export function EditorProvider({
  children,
  defaultBlocks,
}: {
  children: ReactNode;
  defaultBlocks: BlockDef[];
}) {
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [blocks, setBlocks] = useState<BlockDef[]>(defaultBlocks);
  const [blockOrder, setBlockOrder] = useState<string[]>(defaultBlocks.map((b) => b.id));
  const [texts, setTexts] = useState<Record<string, string>>({});

  // History stacks
  const [past, setPast] = useState<HistoryEntry[]>([]);
  const [future, setFuture] = useState<HistoryEntry[]>([]);

  // Refs for current state (avoid stale closures in history callbacks)
  const blocksRef = useRef(blocks);
  const blockOrderRef = useRef(blockOrder);
  const textsRef = useRef(texts);
  useEffect(() => { blocksRef.current = blocks; }, [blocks]);
  useEffect(() => { blockOrderRef.current = blockOrder; }, [blockOrder]);
  useEffect(() => { textsRef.current = texts; }, [texts]);

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // ── Load from DB on mount ──────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("page_layouts")
          .select("layout_json")
          .eq("name", LAYOUT_NAME)
          .maybeSingle();

        if (!data?.layout_json) return;
        const saved = data.layout_json as any;

        if (saved.type === "jarir-editor-v1") {
          if (Array.isArray(saved.blocks)) {
            setBlocks((prev) =>
              prev.map((def) => {
                const s = (saved.blocks as BlockDef[]).find((b) => b.id === def.id);
                return s ? { ...def, style: s.style ?? {} } : def;
              })
            );
          }
          if (Array.isArray(saved.blockOrder)) setBlockOrder(saved.blockOrder);
          if (saved.texts && typeof saved.texts === "object") setTexts(saved.texts);
        }
      } catch (e) {
        console.warn("Could not load layout:", e);
      }
    })();
  }, []);

  // ── History helpers ────────────────────────────────────────────────────────

  const snapshot = useCallback(
    (): HistoryEntry => ({
      blocks: blocksRef.current,
      blockOrder: blockOrderRef.current,
      texts: textsRef.current,
    }),
    []
  );

  const pushHistory = useCallback(() => {
    setPast((prev) => [...prev.slice(-49), snapshot()]);
    setFuture([]);
  }, [snapshot]);

  const undo = useCallback(() => {
    setPast((prev) => {
      if (prev.length === 0) return prev;
      const entry = prev[prev.length - 1];
      setFuture((f) => [snapshot(), ...f]);
      setBlocks(entry.blocks);
      setBlockOrder(entry.blockOrder);
      setTexts(entry.texts);
      return prev.slice(0, -1);
    });
  }, [snapshot]);

  const redo = useCallback(() => {
    setFuture((prev) => {
      if (prev.length === 0) return prev;
      const entry = prev[0];
      setPast((p) => [...p, snapshot()]);
      setBlocks(entry.blocks);
      setBlockOrder(entry.blockOrder);
      setTexts(entry.texts);
      return prev.slice(1);
    });
  }, [snapshot]);

  // ── Block style operations ─────────────────────────────────────────────────

  const getBlockStyle = useCallback(
    (id: string): BlockStyle => blocksRef.current.find((b) => b.id === id)?.style ?? {},
    []
  );

  const updateBlockStyle = useCallback(
    (id: string, updates: Partial<BlockStyle>) => {
      pushHistory();
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, style: { ...b.style, ...updates } } : b))
      );
    },
    [pushHistory]
  );

  const resetBlockStyle = useCallback(
    (id: string) => {
      pushHistory();
      setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, style: {} } : b)));
    },
    [pushHistory]
  );

  const reorderBlocks = useCallback(
    (oldIndex: number, newIndex: number) => {
      pushHistory();
      setBlockOrder((prev) => arrayMove(prev, oldIndex, newIndex));
    },
    [pushHistory]
  );

  // ── Inline text operations ─────────────────────────────────────────────────

  const getText = useCallback(
    (key: string, defaultValue: string) => textsRef.current[key] ?? defaultValue,
    []
  );

  const updateText = useCallback(
    (key: string, value: string) => {
      pushHistory();
      setTexts((prev) => ({ ...prev, [key]: value }));
    },
    [pushHistory]
  );

  // ── Persistence ────────────────────────────────────────────────────────────

  const buildPayload = useCallback(
    (status: string) => ({
      name: LAYOUT_NAME,
      layout_json: {
        type: "jarir-editor-v1",
        blocks: blocksRef.current,
        blockOrder: blockOrderRef.current,
        texts: textsRef.current,
      } as any,
      status,
      updated_at: new Date().toISOString(),
      ...(status === "published" ? { published_at: new Date().toISOString() } : {}),
    }),
    []
  );

  const saveLayout = useCallback(async () => {
    setIsSaving(true);
    try {
      await (supabase.from("page_layouts") as any).upsert(buildPayload("draft"), {
        onConflict: "name",
      });
      setLastSaved(new Date());
    } catch (e) {
      console.error("Save failed:", e);
    } finally {
      setIsSaving(false);
    }
  }, [buildPayload]);

  const publishLayout = useCallback(async () => {
    setIsPublishing(true);
    try {
      await (supabase.from("page_layouts") as any).upsert(buildPayload("published"), {
        onConflict: "name",
      });
      setLastSaved(new Date());
    } catch (e) {
      console.error("Publish failed:", e);
    } finally {
      setIsPublishing(false);
    }
  }, [buildPayload]);

  const toggleEditorMode = useCallback(() => {
    setIsEditorMode((v) => !v);
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
        blockOrder,
        getBlockStyle,
        updateBlockStyle,
        resetBlockStyle,
        reorderBlocks,
        texts,
        getText,
        updateText,
        undo,
        redo,
        canUndo: past.length > 0,
        canRedo: future.length > 0,
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
