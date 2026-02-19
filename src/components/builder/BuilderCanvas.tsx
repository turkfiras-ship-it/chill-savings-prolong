import React, { useState } from 'react';
import { useBuilder } from '@/context/BuilderContext';
import { ElementRenderer } from './ElementRenderer';
import { useDroppable } from '@dnd-kit/core';
import { Eye, EyeOff } from 'lucide-react';

const PreviewModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { layout } = useBuilder();
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-3 border-b bg-gray-50 rounded-t-xl">
          <span className="font-semibold text-gray-700">Preview: {layout.name}</span>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 text-xl font-bold">&times;</button>
        </div>
        <div className="p-8">
          {layout.elements.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No elements to preview</div>
          ) : (
            layout.elements.map((el) => <ElementRenderer key={el.id} element={el} isPreview />)
          )}
        </div>
      </div>
    </div>
  );
};

export const BuilderCanvas: React.FC = () => {
  const { layout, selectedId, setSelectedId } = useBuilder();
  const [showPreview, setShowPreview] = useState(false);
  const [zoom, setZoom] = useState(100);

  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-root',
    data: { parentId: null },
  });

  return (
    <div className="flex flex-col h-full bg-muted/30">
      {/* Canvas Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Zoom:</span>
          {[75, 100, 125, 150].map((z) => (
            <button
              key={z}
              onClick={() => setZoom(z)}
              className={`text-xs px-2 py-0.5 rounded transition-colors ${
                zoom === z ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
              }`}
            >
              {z}%
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowPreview(true)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-accent hover:bg-accent/80 transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto p-8">
        <div
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          className="transition-transform"
        >
          <div
            ref={setNodeRef}
            onClick={() => setSelectedId(null)}
            className={`mx-auto bg-white shadow-xl rounded-xl min-h-[700px] transition-all ${
              isOver ? 'ring-2 ring-primary ring-offset-2' : ''
            }`}
            style={{ width: '860px', minHeight: '700px' }}
          >
            {layout.elements.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[700px] text-muted-foreground gap-3">
                <div className="text-5xl opacity-40">🖼️</div>
                <p className="font-medium">Your canvas is empty</p>
                <p className="text-sm opacity-70">Drag elements from the left panel to get started</p>
              </div>
            ) : (
              <div className="p-6 space-y-2">
                {layout.elements.map((el) => (
                  <ElementRenderer key={el.id} element={el} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showPreview && <PreviewModal onClose={() => setShowPreview(false)} />}
    </div>
  );
};
