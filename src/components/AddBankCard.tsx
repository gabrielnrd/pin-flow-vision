import { useState } from "react";
import { Plus, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BANK_PRESETS = [
  { label: "Nubank", color: "bank-nubank", glow: "glow-nubank" },
  { label: "Inter", color: "bank-inter", glow: "glow-inter" },
  { label: "C6 Bank", color: "bank-c6", glow: "glow-c6" },
  { label: "Itaú", color: "bank-itau", glow: "glow-itau" },
  { label: "Banco do Brasil", color: "bank-bb", glow: "glow-bb" },
  { label: "Outro", color: "bank-nubank", glow: "glow-nubank" },
];

interface AddBankCardProps {
  onAdd: (name: string, limitTotal: number, color: string, glowClass: string) => void;
}

export function AddBankCard({ onAdd }: AddBankCardProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("");
  const [preset, setPreset] = useState("0");

  const handleAdd = () => {
    const limitVal = parseFloat(limit);
    if (!name.trim() || isNaN(limitVal) || limitVal <= 0) return;
    const p = BANK_PRESETS[parseInt(preset)];
    onAdd(name.trim(), limitVal, p.color, p.glow);
    setName("");
    setLimit("");
    setPreset("0");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="masonry-item w-full rounded-2xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 cursor-pointer flex items-center justify-center gap-3 text-muted-foreground hover:text-primary transition-colors p-8" style={{ aspectRatio: "1.586/1" }}>
          <Plus className="w-6 h-6" />
          <span className="text-sm font-medium">Novo Cartão</span>
        </div>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Adicionar Cartão
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Banco / Bandeira</label>
            <Select value={preset} onValueChange={setPreset}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BANK_PRESETS.map((p, i) => (
                  <SelectItem key={i} value={String(i)}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Nome do cartão</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Nubank Platinum"
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Limite total (R$)</label>
            <Input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="10000"
              className="bg-secondary border-border"
            />
          </div>
          <Button onClick={handleAdd} className="w-full" disabled={!name.trim() || !limit}>
            Adicionar Cartão
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
