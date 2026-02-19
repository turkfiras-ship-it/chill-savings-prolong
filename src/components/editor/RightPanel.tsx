import { Sliders, RotateCcw } from "lucide-react";
import { useEditor, BlockStyle } from "@/context/EditorContext";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
      {children}
    </p>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-7 px-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

export function RightPanel() {
  const { selectedId, blocks, updateBlockStyle, resetBlockStyle } = useEditor();
  const block = blocks.find((b) => b.id === selectedId);

  if (!selectedId || !block) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground p-6">
        <Sliders className="h-8 w-8 opacity-20" />
        <div className="text-center">
          <p className="text-xs font-medium">No block selected</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Click any section on the canvas to edit its properties
          </p>
        </div>
      </div>
    );
  }

  const s = block.style;
  const set = (key: keyof BlockStyle, val: string) => updateBlockStyle(selectedId, { [key]: val });

  return (
    <div className="p-3 space-y-5 text-sm">
      {/* Block identity */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-foreground">{block.label}</p>
          <p className="text-[10px] text-muted-foreground">{block.id}</p>
        </div>
        <button
          onClick={() => resetBlockStyle(selectedId)}
          className="p-1.5 rounded hover:bg-secondary transition-colors"
          title="Reset all styles"
        >
          <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      <hr className="border-border" />

      {/* Padding */}
      <div>
        <Label>Padding</Label>
        <div className="grid grid-cols-2 gap-2">
          <TextInput label="Top" value={s.paddingTop ?? ""} onChange={(v) => set("paddingTop", v)} placeholder="48px" />
          <TextInput label="Bottom" value={s.paddingBottom ?? ""} onChange={(v) => set("paddingBottom", v)} placeholder="48px" />
          <TextInput label="Left" value={s.paddingLeft ?? ""} onChange={(v) => set("paddingLeft", v)} placeholder="24px" />
          <TextInput label="Right" value={s.paddingRight ?? ""} onChange={(v) => set("paddingRight", v)} placeholder="24px" />
        </div>
      </div>

      {/* Margin */}
      <div>
        <Label>Margin</Label>
        <div className="grid grid-cols-2 gap-2">
          <TextInput label="Top" value={s.marginTop ?? ""} onChange={(v) => set("marginTop", v)} placeholder="0px" />
          <TextInput label="Bottom" value={s.marginBottom ?? ""} onChange={(v) => set("marginBottom", v)} placeholder="0px" />
        </div>
      </div>

      {/* Background */}
      <div>
        <Label>Background</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={s.backgroundColor || "#ffffff"}
            onChange={(e) => set("backgroundColor", e.target.value)}
            className="h-8 w-10 rounded border border-input cursor-pointer bg-transparent p-0.5 shrink-0"
          />
          <input
            type="text"
            value={s.backgroundColor ?? ""}
            onChange={(e) => set("backgroundColor", e.target.value)}
            placeholder="transparent"
            className="flex-1 h-7 px-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Opacity */}
      <div>
        <Label>Opacity</Label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={s.opacity ?? "1"}
            onChange={(e) => set("opacity", e.target.value)}
            className="flex-1 accent-primary"
          />
          <span className="text-xs w-9 text-right tabular-nums">
            {Math.round(Number(s.opacity ?? 1) * 100)}%
          </span>
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <Label>Border Radius</Label>
        <TextInput label="" value={s.borderRadius ?? ""} onChange={(v) => set("borderRadius", v)} placeholder="0px / 12px" />
      </div>

      {/* Text Alignment */}
      <div>
        <Label>Text Alignment</Label>
        <div className="flex gap-1">
          {(["left", "center", "right"] as const).map((align) => (
            <button
              key={align}
              onClick={() => set("textAlign", align)}
              className={`flex-1 py-1.5 text-xs rounded-md capitalize transition-colors font-medium ${
                s.textAlign === align
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/70 text-foreground"
              }`}
            >
              {align}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
