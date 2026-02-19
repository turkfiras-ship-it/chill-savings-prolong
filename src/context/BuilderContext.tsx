import React, { createContext, useContext, useState, useCallback } from 'react';
import { PageElement, PageLayout, ElementType, ELEMENT_LIBRARY } from '@/types/builder';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

function generateId() {
  return `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

interface BuilderContextType {
  layout: PageLayout;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  addElement: (type: ElementType, parentId?: string) => void;
  updateElement: (id: string, updates: Partial<PageElement>) => void;
  deleteElement: (id: string) => void;
  moveElement: (id: string, direction: 'up' | 'down', parentId?: string) => void;
  reorderElements: (orderedIds: string[], parentId?: string) => void;
  setLayoutName: (name: string) => void;
  saveLayout: () => Promise<void>;
  loadLayout: (id: string) => Promise<void>;
  publishLayout: () => Promise<void>;
  savedLayouts: { id: string; name: string; status: string }[];
  loadSavedLayouts: () => Promise<void>;
  isSaving: boolean;
  selectedElement: PageElement | null;
}

const BuilderContext = createContext<BuilderContextType | null>(null);

function findElementById(elements: PageElement[], id: string): PageElement | null {
  for (const el of elements) {
    if (el.id === id) return el;
    if (el.children) {
      const found = findElementById(el.children, id);
      if (found) return found;
    }
  }
  return null;
}

function updateElementById(elements: PageElement[], id: string, updates: Partial<PageElement>): PageElement[] {
  return elements.map((el) => {
    if (el.id === id) return { ...el, ...updates, style: { ...el.style, ...(updates.style || {}) } };
    if (el.children) return { ...el, children: updateElementById(el.children, id, updates) };
    return el;
  });
}

function deleteElementById(elements: PageElement[], id: string): PageElement[] {
  return elements
    .filter((el) => el.id !== id)
    .map((el) => ({
      ...el,
      children: el.children ? deleteElementById(el.children, id) : undefined,
    }));
}

export const BuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [layout, setLayout] = useState<PageLayout>({
    name: 'Untitled Page',
    elements: [],
    status: 'draft',
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedLayouts, setSavedLayouts] = useState<{ id: string; name: string; status: string }[]>([]);

  const selectedElement = selectedId ? findElementById(layout.elements, selectedId) : null;

  const addElement = useCallback((type: ElementType, parentId?: string) => {
    const lib = ELEMENT_LIBRARY.find((e) => e.type === type);
    if (!lib) return;
    const newEl: PageElement = {
      id: generateId(),
      type,
      content: lib.defaultProps.content,
      src: lib.defaultProps.src,
      alt: lib.defaultProps.alt,
      href: lib.defaultProps.href,
      style: { ...(lib.defaultProps.style || {}) },
      children: lib.defaultProps.children ? [] : undefined,
    };

    setLayout((prev) => {
      if (!parentId) {
        return { ...prev, elements: [...prev.elements, newEl] };
      }
      const updated = updateElementById(prev.elements, parentId, {
        children: [...(findElementById(prev.elements, parentId)?.children || []), newEl],
      } as any);
      return { ...prev, elements: updated };
    });
    setSelectedId(newEl.id);
  }, []);

  const updateElement = useCallback((id: string, updates: Partial<PageElement>) => {
    setLayout((prev) => ({
      ...prev,
      elements: updateElementById(prev.elements, id, updates),
    }));
  }, []);

  const deleteElement = useCallback((id: string) => {
    setLayout((prev) => ({ ...prev, elements: deleteElementById(prev.elements, id) }));
    setSelectedId(null);
  }, []);

  const moveElement = useCallback((id: string, direction: 'up' | 'down', parentId?: string) => {
    setLayout((prev) => {
      const arr = parentId
        ? findElementById(prev.elements, parentId)?.children || []
        : prev.elements;
      const idx = arr.findIndex((el) => el.id === id);
      if (idx === -1) return prev;
      const newArr = [...arr];
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= newArr.length) return prev;
      [newArr[idx], newArr[swapIdx]] = [newArr[swapIdx], newArr[idx]];

      if (!parentId) return { ...prev, elements: newArr };
      return { ...prev, elements: updateElementById(prev.elements, parentId, { children: newArr } as any) };
    });
  }, []);

  const reorderElements = useCallback((orderedIds: string[], parentId?: string) => {
    setLayout((prev) => {
      const arr = parentId
        ? findElementById(prev.elements, parentId)?.children || []
        : prev.elements;
      const map = Object.fromEntries(arr.map((el) => [el.id, el]));
      const reordered = orderedIds.map((id) => map[id]).filter(Boolean);
      if (!parentId) return { ...prev, elements: reordered };
      return { ...prev, elements: updateElementById(prev.elements, parentId, { children: reordered } as any) };
    });
  }, []);

  const setLayoutName = useCallback((name: string) => {
    setLayout((prev) => ({ ...prev, name }));
  }, []);

  const saveLayout = useCallback(async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: layout.name,
        layout_json: layout.elements as any,
        status: layout.status,
      };
      let result;
      if (layout.id) {
        result = await supabase.from('page_layouts').update(payload).eq('id', layout.id).select().single();
      } else {
        result = await supabase.from('page_layouts').insert(payload).select().single();
      }
      if (result.error) throw result.error;
      setLayout((prev) => ({ ...prev, id: result.data.id }));
      toast({ title: '✅ Saved', description: 'Layout saved successfully.' });
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [layout, toast]);

  const loadLayout = useCallback(async (id: string) => {
    const { data, error } = await supabase.from('page_layouts').select('*').eq('id', id).single();
    if (error) { toast({ title: 'Load failed', description: error.message, variant: 'destructive' }); return; }
    setLayout({
      id: data.id,
      name: data.name,
      elements: (data.layout_json as unknown as PageElement[]) || [],
      status: data.status as 'draft' | 'published',
    });
    setSelectedId(null);
    toast({ title: '📂 Loaded', description: `"${data.name}" loaded.` });
  }, [toast]);

  const publishLayout = useCallback(async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: layout.name,
        layout_json: layout.elements as any,
        status: 'published' as const,
        published_at: new Date().toISOString(),
      };
      let result;
      if (layout.id) {
        result = await supabase.from('page_layouts').update(payload).eq('id', layout.id).select().single();
      } else {
        result = await supabase.from('page_layouts').insert(payload).select().single();
      }
      if (result.error) throw result.error;
      setLayout((prev) => ({ ...prev, id: result.data.id, status: 'published' }));
      toast({ title: '🚀 Published!', description: 'Your page is now live.' });
    } catch (e: any) {
      toast({ title: 'Publish failed', description: e.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [layout, toast]);

  const loadSavedLayouts = useCallback(async () => {
    const { data } = await supabase.from('page_layouts').select('id, name, status').order('updated_at', { ascending: false });
    setSavedLayouts((data || []) as { id: string; name: string; status: string }[]);
  }, []);

  return (
    <BuilderContext.Provider value={{
      layout, selectedId, setSelectedId, addElement, updateElement, deleteElement,
      moveElement, reorderElements, setLayoutName, saveLayout, loadLayout, publishLayout,
      savedLayouts, loadSavedLayouts, isSaving, selectedElement,
    }}>
      {children}
    </BuilderContext.Provider>
  );
};

export const useBuilder = () => {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error('useBuilder must be used within BuilderProvider');
  return ctx;
};
