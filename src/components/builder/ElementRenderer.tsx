import React from 'react';
import { PageElement } from '@/types/builder';
import { useBuilder } from '@/context/BuilderContext';
import { useDroppable } from '@dnd-kit/core';

interface ElementRendererProps {
  element: PageElement;
  isPreview?: boolean;
}

const ElementRenderer: React.FC<ElementRendererProps> = ({ element, isPreview }) => {
  const { selectedId, setSelectedId } = useBuilder();
  const isSelected = !isPreview && selectedId === element.id;

  const handleClick = (e: React.MouseEvent) => {
    if (isPreview) return;
    e.stopPropagation();
    setSelectedId(element.id);
  };

  const style: React.CSSProperties = { ...element.style } as React.CSSProperties;

  const wrapperClass = isPreview ? '' : `relative group cursor-pointer transition-all ${
    isSelected
      ? 'outline outline-2 outline-primary outline-offset-1'
      : 'hover:outline hover:outline-1 hover:outline-primary/40 hover:outline-offset-1'
  }`;

  const SelectionBadge = () =>
    isSelected && !isPreview ? (
      <div className="absolute -top-5 left-0 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-t font-medium z-10 whitespace-nowrap capitalize">
        {element.type}
      </div>
    ) : null;

  switch (element.type) {
    case 'heading':
      return (
        <div className={wrapperClass} style={style} onClick={handleClick}>
          <SelectionBadge />
          <h2 style={{ fontSize: style.fontSize, fontWeight: style.fontWeight, color: style.color, textAlign: style.textAlign as any, lineHeight: style.lineHeight, fontFamily: style.fontFamily }}>
            {element.content}
          </h2>
        </div>
      );

    case 'text':
      return (
        <div className={wrapperClass} style={style} onClick={handleClick}>
          <SelectionBadge />
          <p style={{ fontSize: style.fontSize, color: style.color, textAlign: style.textAlign as any, lineHeight: style.lineHeight, fontFamily: style.fontFamily }}>
            {element.content}
          </p>
        </div>
      );

    case 'image':
      return (
        <div className={wrapperClass} onClick={handleClick}>
          <SelectionBadge />
          <img src={element.src} alt={element.alt} style={style} />
        </div>
      );

    case 'button':
      return (
        <div className={wrapperClass} onClick={handleClick}>
          <SelectionBadge />
          <a
            href={isPreview ? element.href : undefined}
            style={style}
            className="inline-block cursor-pointer select-none"
            onClick={(e) => !isPreview && e.preventDefault()}
          >
            {element.content}
          </a>
        </div>
      );

    case 'card':
      return (
        <div className={wrapperClass} style={style} onClick={handleClick}>
          <SelectionBadge />
          <p style={{ color: style.color, fontSize: style.fontSize }}>{element.content}</p>
        </div>
      );

    case 'divider':
      return (
        <div className={wrapperClass} style={{ margin: style.margin, width: style.width }} onClick={handleClick}>
          <SelectionBadge />
          <hr style={{ borderColor: style.borderColor, borderTopWidth: style.borderWidth || '1px', borderStyle: 'solid' }} />
        </div>
      );

    case 'spacer':
      return (
        <div
          className={`${wrapperClass} ${!isPreview ? 'bg-accent/20 border border-dashed border-border' : ''}`}
          style={{ height: style.height, width: style.width }}
          onClick={handleClick}
        >
          <SelectionBadge />
          {!isPreview && (
            <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
              Spacer ({style.height})
            </div>
          )}
        </div>
      );

    case 'section':
    case 'container':
      return (
        <SectionContainer element={element} isPreview={isPreview} />
      );

    default:
      return null;
  }
};

const SectionContainer: React.FC<{ element: PageElement; isPreview?: boolean }> = ({ element, isPreview }) => {
  const { selectedId, setSelectedId } = useBuilder();
  const isSelected = !isPreview && selectedId === element.id;
  const { setNodeRef, isOver } = useDroppable({ id: `drop_${element.id}`, data: { parentId: element.id } });

  const handleClick = (e: React.MouseEvent) => {
    if (isPreview) return;
    e.stopPropagation();
    setSelectedId(element.id);
  };

  const style: React.CSSProperties = { ...element.style } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      className={`relative transition-all ${
        isPreview ? '' : `cursor-pointer ${
          isSelected
            ? 'outline outline-2 outline-primary outline-offset-1'
            : 'hover:outline hover:outline-1 hover:outline-primary/40 hover:outline-offset-1'
        } ${isOver ? 'bg-primary/5' : ''}`
      }`}
    >
      {isSelected && !isPreview && (
        <div className="absolute -top-5 left-0 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-t font-medium z-10 capitalize">
          {element.type}
        </div>
      )}
      {element.children && element.children.length > 0 ? (
        element.children.map((child) => (
          <ElementRenderer key={child.id} element={child} isPreview={isPreview} />
        ))
      ) : (
        !isPreview && (
          <div className="flex items-center justify-center h-full min-h-[80px] text-xs text-muted-foreground border-2 border-dashed border-border/50 rounded-lg">
            Drop elements here
          </div>
        )
      )}
    </div>
  );
};

export { ElementRenderer };
