import React from 'react';
import { useBuilder } from '@/context/BuilderContext';
import { ELEMENT_LIBRARY, PageElement, ElementType } from '@/types/builder';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ChevronUp, ChevronDown, Trash2, ChevronRight, Layers } from 'lucide-react';

// Draggable item from library
const LibraryItem: React.FC<{ type: ElementType; label: string; icon: string }> = ({ type, label, icon }) => {
  const { addElement } = useBuilder();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `library_${type}`,
    data: { fromLibrary: true, elementType: type },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onDoubleClick={() => addElement(type)}
      title={`Drag to canvas or double-click to add`}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-accent hover:border-primary/40 cursor-grab active:cursor-grabbing transition-all text-sm select-none"
    >
      <span className="text-base w-5 text-center">{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
  );
};

// Layer tree item
const LayerItem: React.FC<{ element: PageElement; depth?: number }> = ({ element, depth = 0 }) => {
  const { selectedId, setSelectedId, deleteElement, moveElement } = useBuilder();
  const [expanded, setExpanded] = React.useState(true);
  const isSelected = selectedId === element.id;
  const hasChildren = element.children && element.children.length > 0;
  const lib = ELEMENT_LIBRARY.find((e) => e.type === element.type);

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer text-xs group transition-colors ${
          isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
        }`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => setSelectedId(element.id)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="opacity-60 hover:opacity-100"
          >
            <ChevronRight className={`h-3 w-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        ) : (
          <span className="w-3" />
        )}
        <span className="mr-1">{lib?.icon}</span>
        <span className="flex-1 truncate capitalize">{element.type}</span>
        <div className={`flex gap-0.5 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button
            onClick={(e) => { e.stopPropagation(); moveElement(element.id, 'up'); }}
            className="p-0.5 rounded hover:bg-black/10"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); moveElement(element.id, 'down'); }}
            className="p-0.5 rounded hover:bg-black/10"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); deleteElement(element.id); }}
            className="p-0.5 rounded hover:bg-destructive/20 text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      {hasChildren && expanded && element.children!.map((child) => (
        <LayerItem key={child.id} element={child} depth={depth + 1} />
      ))}
    </div>
  );
};

export const ElementsLibrary: React.FC = () => {
  const { layout, savedLayouts, loadLayout, loadSavedLayouts } = useBuilder();
  const [tab, setTab] = React.useState<'elements' | 'layers' | 'pages'>('elements');

  React.useEffect(() => {
    if (tab === 'pages') loadSavedLayouts();
  }, [tab, loadSavedLayouts]);

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Tab switcher */}
      <div className="flex border-b border-border">
        {(['elements', 'layers', 'pages'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${
              tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            {t === 'layers' ? <span className="flex items-center justify-center gap-1"><Layers className="h-3 w-3" />Layers</span> : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {tab === 'elements' && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Drag or double-click</p>
            {ELEMENT_LIBRARY.map((el) => (
              <LibraryItem key={el.type} type={el.type} label={el.label} icon={el.icon} />
            ))}
          </div>
        )}

        {tab === 'layers' && (
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Page Structure</p>
            {layout.elements.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No elements yet</p>
            ) : (
              layout.elements.map((el) => <LayerItem key={el.id} element={el} />)
            )}
          </div>
        )}

        {tab === 'pages' && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Saved Pages</p>
            {savedLayouts.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No saved pages yet</p>
            ) : savedLayouts.map((p) => (
              <button
                key={p.id}
                onClick={() => loadLayout(p.id)}
                className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors hover:bg-accent ${
                  layout.id === p.id ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="font-medium truncate">{p.name}</div>
                <div className={`text-xs mt-0.5 ${p.status === 'published' ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {p.status === 'published' ? '🟢 Published' : '⚪ Draft'}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
