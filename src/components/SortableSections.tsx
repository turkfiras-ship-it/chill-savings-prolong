import { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { DraggableSection } from "./DraggableSection";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface SectionDef {
  id: string;
  label: string;
  node: ReactNode;
}

interface SortableSectionsProps {
  sections: SectionDef[];
  isEditMode: boolean;
  className?: string;
}

export function SortableSections({ sections: initialSections, isEditMode, className }: SortableSectionsProps) {
  const [sections, setSections] = useState<SectionDef[]>(initialSections);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Reset order when sections definition changes (tab switch)
  // We keep a stable key so order persists within a tab session

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      setSections(prev => {
        const oldIndex = prev.findIndex(s => s.id === active.id);
        const newIndex = prev.findIndex(s => s.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  const activeSection = sections.find(s => s.id === activeId);

  if (!isEditMode) {
    return (
      <div className={cn("space-y-6", className)}>
        {sections.map(s => (
          <div key={s.id}>{s.node}</div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
        <div className={cn("space-y-6", className)}>
          {sections.map(s => (
            <DraggableSection key={s.id} id={s.id} isEditMode={isEditMode} label={s.label}>
              {s.node}
            </DraggableSection>
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
        {activeSection && (
          <div className="opacity-90 shadow-2xl rounded-xl ring-2 ring-primary scale-[1.01] bg-card">
            {activeSection.node}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
