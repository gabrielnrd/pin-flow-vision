import { Check } from "lucide-react";
import { CARD_COLORS } from "@/data/cardColors";

interface CardColorPickerProps {
  value: string;
  onChange: (colorId: string, glowClass: string) => void;
  label?: string;
}

export function CardColorPicker({ value, onChange, label = "Cor do cartão" }: CardColorPickerProps) {
  const groups: { key: "banco" | "pantone"; title: string }[] = [
    { key: "banco", title: "Bancos" },
    { key: "pantone", title: "Tons Pantone" },
  ];

  return (
    <div className="space-y-3">
      <label className="text-xs text-muted-foreground block">{label}</label>
      {groups.map((g) => (
        <div key={g.key} className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">{g.title}</p>
          <div className="flex flex-wrap gap-2">
            {CARD_COLORS.filter((c) => c.group === g.key).map((c) => {
              const active = value === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  title={c.label}
                  aria-label={c.label}
                  onClick={() => onChange(c.id, c.glow)}
                  className={`w-8 h-8 rounded-lg border transition-all flex items-center justify-center ${
                    active ? "border-primary scale-110" : "border-border/60 hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {active && <Check className="w-4 h-4 text-white drop-shadow" />}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
