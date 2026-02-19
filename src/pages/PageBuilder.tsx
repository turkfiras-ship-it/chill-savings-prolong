import React, { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent,
} from '@dnd-kit/core';
import { BuilderProvider, useBuilder } from '@/context/BuilderContext';
import { ElementsLibrary } from '@/components/builder/ElementsLibrary';
import { BuilderCanvas } from '@/components/builder/BuilderCanvas';
import { PropertiesPanel } from '@/components/builder/PropertiesPanel';
import { ElementType } from '@/types/builder';
import { Save, Globe, ArrowLeft, Pencil, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const BuilderInner: React.FC = () => {
  const { addElement, reorderElements, layout, setLayoutName, saveLayout, publishLayout, isSaving } = useBuilder();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(layout.name);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current as any;
    const overId = String(over.id);

    // Drag from library onto canvas or container
    if (activeData?.fromLibrary) {
      const type = activeData.elementType as ElementType;
      const parentId = overId.startsWith('drop_')
        ? overId.replace('drop_', '')
        : overId === 'canvas-root'
        ? undefined
        : undefined;
      addElement(type, parentId);
    }
  }, [addElement]);

  const saveName = () => {
    setLayoutName(nameInput);
    setEditingName(false);
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-1.5 rounded hover:bg-accent transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="w-px h-5 bg-border" />
          {editingName ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                className="h-7 px-2 text-sm border border-primary rounded bg-background focus:outline-none"
              />
              <button onClick={saveName} className="p-1 rounded hover:bg-accent">
                <Check className="h-4 w-4 text-primary" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setNameInput(layout.name); setEditingName(true); }}
              className="flex items-center gap-1.5 text-sm font-semibold hover:text-primary transition-colors group"
            >
              {layout.name}
              <Pencil className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
            </button>
          )}
          <div className={`text-xs px-2 py-0.5 rounded-full ${
            layout.status === 'published'
              ? 'bg-green-100 text-green-700'
              : 'bg-muted text-muted-foreground'
          }`}>
            {layout.status === 'published' ? '🟢 Published' : '⚪ Draft'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={saveLayout}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border border-border hover:bg-accent transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={publishLayout}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
          >
            <Globe className="h-4 w-4" />
            Publish
          </button>
        </div>
      </header>

      {/* 3-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {/* Left Panel */}
          <aside className="w-56 shrink-0 overflow-hidden">
            <ElementsLibrary />
          </aside>

          {/* Center Canvas */}
          <main className="flex-1 overflow-hidden">
            <BuilderCanvas />
          </main>

          <DragOverlay>
            {activeId && activeId.startsWith('library_') && (
              <div className="px-3 py-2 rounded-lg border border-primary bg-primary/10 text-primary text-sm font-medium shadow-lg cursor-grabbing">
                + {activeId.replace('library_', '')}
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {/* Right Panel */}
        <aside className="w-64 shrink-0 overflow-hidden">
          <PropertiesPanel />
        </aside>
      </div>
    </div>
  );
};

const PageBuilder: React.FC = () => (
  <BuilderProvider>
    <BuilderInner />
  </BuilderProvider>
);

export default PageBuilder;
