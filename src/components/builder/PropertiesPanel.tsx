import React from 'react';
import { useBuilder } from '@/context/BuilderContext';
import { PageElement } from '@/types/builder';
import { Trash2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="border-b border-border pb-4 mb-4">
    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{title}</h4>
    {children}
  </div>
);

const FieldRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center gap-2 mb-2">
    <label className="text-xs text-muted-foreground w-20 shrink-0">{label}</label>
    <div className="flex-1">{children}</div>
  </div>
);

const TextInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}> = ({ value, onChange, placeholder, type = 'text' }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full h-7 px-2 text-xs border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
  />
);

const ColorInput: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <div className="flex items-center gap-1.5">
    <input
      type="color"
      value={value || '#000000'}
      onChange={(e) => onChange(e.target.value)}
      className="w-7 h-7 rounded cursor-pointer border border-border"
    />
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="#000000"
      className="flex-1 h-7 px-2 text-xs border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
    />
  </div>
);

const SelectInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}> = ({ value, onChange, options }) => (
  <select
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    className="w-full h-7 px-2 text-xs border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
  >
    <option value="">Default</option>
    {options.map((o) => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
);

export const PropertiesPanel: React.FC = () => {
  const { selectedElement, updateElement, deleteElement } = useBuilder();

  if (!selectedElement) {
    return (
      <div className="h-full bg-card border-l border-border flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-4xl mb-3">🖱️</div>
          <p className="text-sm text-muted-foreground">Click an element on the canvas to edit its properties</p>
        </div>
      </div>
    );
  }

  const el = selectedElement;
  const s = el.style;

  const updateStyle = (key: string, value: string) => {
    updateElement(el.id, { style: { ...s, [key]: value } });
  };

  const updateContent = (content: string) => updateElement(el.id, { content });
  const updateSrc = (src: string) => updateElement(el.id, { src });
  const updateAlt = (alt: string) => updateElement(el.id, { alt });
  const updateHref = (href: string) => updateElement(el.id, { href });

  return (
    <div className="h-full bg-card border-l border-border flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Properties</p>
          <h3 className="font-semibold text-sm capitalize">{el.type}</h3>
        </div>
        <button
          onClick={() => deleteElement(el.id)}
          className="p-1.5 rounded text-destructive hover:bg-destructive/10 transition-colors"
          title="Delete element"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Content Section */}
        {(el.type === 'text' || el.type === 'heading' || el.type === 'button' || el.type === 'card') && (
          <Section title="Content">
            <div className="mb-2">
              <label className="text-xs text-muted-foreground block mb-1">Text</label>
              <textarea
                value={el.content || ''}
                onChange={(e) => updateContent(e.target.value)}
                rows={3}
                className="w-full px-2 py-1.5 text-xs border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
            {el.type === 'button' && (
              <FieldRow label="Link URL">
                <TextInput value={el.href || ''} onChange={updateHref} placeholder="https://..." />
              </FieldRow>
            )}
          </Section>
        )}

        {el.type === 'image' && (
          <Section title="Image">
            <FieldRow label="Source URL">
              <TextInput value={el.src || ''} onChange={updateSrc} placeholder="https://..." />
            </FieldRow>
            <FieldRow label="Alt Text">
              <TextInput value={el.alt || ''} onChange={updateAlt} placeholder="Alt text..." />
            </FieldRow>
          </Section>
        )}

        {/* Typography */}
        {(el.type === 'text' || el.type === 'heading' || el.type === 'button' || el.type === 'card') && (
          <Section title="Typography">
            <FieldRow label="Font Size">
              <TextInput value={s.fontSize || ''} onChange={(v) => updateStyle('fontSize', v)} placeholder="16px" />
            </FieldRow>
            <FieldRow label="Font Weight">
              <SelectInput
                value={s.fontWeight || ''}
                onChange={(v) => updateStyle('fontWeight', v)}
                options={[
                  { label: 'Normal (400)', value: '400' },
                  { label: 'Medium (500)', value: '500' },
                  { label: 'Semibold (600)', value: '600' },
                  { label: 'Bold (700)', value: '700' },
                  { label: 'Extra Bold (800)', value: '800' },
                ]}
              />
            </FieldRow>
            <FieldRow label="Font Family">
              <SelectInput
                value={s.fontFamily || ''}
                onChange={(v) => updateStyle('fontFamily', v)}
                options={[
                  { label: 'System Default', value: 'inherit' },
                  { label: 'Serif', value: 'Georgia, serif' },
                  { label: 'Monospace', value: 'monospace' },
                  { label: 'Arial', value: 'Arial, sans-serif' },
                ]}
              />
            </FieldRow>
            <FieldRow label="Line Height">
              <TextInput value={s.lineHeight || ''} onChange={(v) => updateStyle('lineHeight', v)} placeholder="1.5" />
            </FieldRow>
            <FieldRow label="Color">
              <ColorInput value={s.color || '#000000'} onChange={(v) => updateStyle('color', v)} />
            </FieldRow>
            <FieldRow label="Alignment">
              <div className="flex gap-1">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => updateStyle('textAlign', align)}
                    className={`flex-1 h-7 rounded border flex items-center justify-center transition-colors ${
                      s.textAlign === align ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'
                    }`}
                  >
                    {align === 'left' ? <AlignLeft className="h-3.5 w-3.5" /> : align === 'center' ? <AlignCenter className="h-3.5 w-3.5" /> : <AlignRight className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            </FieldRow>
          </Section>
        )}

        {/* Background */}
        <Section title="Background">
          <FieldRow label="Color">
            <ColorInput
              value={s.backgroundColor || ''}
              onChange={(v) => updateStyle('backgroundColor', v)}
            />
          </FieldRow>
          {(el.type === 'section' || el.type === 'container') && (
            <FieldRow label="Image URL">
              <TextInput
                value={s.backgroundImage?.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '') || ''}
                onChange={(v) => updateStyle('backgroundImage', v ? `url('${v}')` : '')}
                placeholder="https://..."
              />
            </FieldRow>
          )}
        </Section>

        {/* Size */}
        <Section title="Size">
          <FieldRow label="Width">
            <TextInput value={s.width || ''} onChange={(v) => updateStyle('width', v)} placeholder="100%" />
          </FieldRow>
          <FieldRow label="Height">
            <TextInput value={s.height || s.minHeight || ''} onChange={(v) => updateStyle('minHeight', v)} placeholder="auto" />
          </FieldRow>
        </Section>

        {/* Spacing */}
        <Section title="Spacing">
          <FieldRow label="Padding">
            <TextInput value={s.padding || ''} onChange={(v) => updateStyle('padding', v)} placeholder="16px" />
          </FieldRow>
          <FieldRow label="Margin">
            <TextInput value={s.margin || ''} onChange={(v) => updateStyle('margin', v)} placeholder="0px" />
          </FieldRow>
        </Section>

        {/* Border */}
        <Section title="Border">
          <FieldRow label="Radius">
            <TextInput value={s.borderRadius || ''} onChange={(v) => updateStyle('borderRadius', v)} placeholder="8px" />
          </FieldRow>
          <FieldRow label="Width">
            <TextInput value={s.borderWidth || ''} onChange={(v) => updateStyle('borderWidth', v)} placeholder="1px" />
          </FieldRow>
          <FieldRow label="Color">
            <ColorInput value={s.borderColor || '#e5e7eb'} onChange={(v) => updateStyle('borderColor', v)} />
          </FieldRow>
        </Section>

        {/* Effects */}
        <Section title="Effects">
          <FieldRow label="Shadow">
            <TextInput
              value={s.boxShadow || ''}
              onChange={(v) => updateStyle('boxShadow', v)}
              placeholder="0 2px 8px rgba(0,0,0,0.1)"
            />
          </FieldRow>
          <FieldRow label="Opacity">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={parseFloat(s.opacity || '1')}
              onChange={(e) => updateStyle('opacity', e.target.value)}
              className="w-full"
            />
          </FieldRow>
        </Section>
      </div>
    </div>
  );
};
