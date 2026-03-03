import { useState } from "react";
import { type Bank, type BankId } from "@/data/financialData";
import { CreditCard, AlertTriangle, Pencil, Check, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface BankCardProps {
  bank: Bank;
  index: number;
  onClick: () => void;
  onUpdateBalance: (bankId: BankId, newUsed: number) => void;
  onUpdateBank?: (bankId: BankId, updates: Partial<Pick<Bank, "name" | "limitTotal" | "status">>) => void;
}

const statusLabels = {
  pendente: "Pendente",
  pago: "Pago",
  parcial: "Parcial",
};

const statusStyles = {
  pendente: "bg-expense/20 text-expense border-expense/30",
  pago: "bg-income/20 text-income border-income/30",
  parcial: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const bankBgAccent: Record<string, string> = {
  "bank-nubank": "from-[hsl(280,97%,38%)]/10 to-transparent",
  "bank-inter": "from-[hsl(27,100%,50%)]/10 to-transparent",
  "bank-c6": "from-[hsl(220,10%,30%)]/10 to-transparent",
  "bank-itau": "from-[hsl(27,85%,47%)]/10 to-transparent",
  "bank-bb": "from-[hsl(45,100%,50%)]/10 to-transparent",
};

const bankProgressColor: Record<string, string> = {
  "bank-nubank": "[&>div]:bg-bank-nubank",
  "bank-inter": "[&>div]:bg-bank-inter",
  "bank-c6": "[&>div]:bg-muted-foreground",
  "bank-itau": "[&>div]:bg-bank-itau",
  "bank-bb": "[&>div]:bg-bank-bb",
};

const statusOptions: Bank["status"][] = ["pendente", "pago", "parcial"];

function EditableField({ value, onSave, type = "text", prefix, className = "" }: {
  value: string | number;
  onSave: (v: string) => void;
  type?: string;
  prefix?: string;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(String(value));

  const save = () => {
    onSave(editVal);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <Input
          type={type}
          value={editVal}
          onChange={(e) => setEditVal(e.target.value)}
          className="h-7 text-xs rounded-lg w-24"
          autoFocus
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
        />
        <button onClick={save} className="p-1 rounded hover:bg-income/20 text-income"><Check className="w-3.5 h-3.5" /></button>
        <button onClick={() => setEditing(false)} className="p-1 rounded hover:bg-expense/20 text-expense"><X className="w-3.5 h-3.5" /></button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 group/edit cursor-pointer" onClick={(e) => { e.stopPropagation(); setEditVal(String(value)); setEditing(true); }}>
      <span className={className}>{prefix}{typeof value === "number" ? value.toLocaleString("pt-BR") : value}</span>
      <Pencil className="w-3 h-3 opacity-0 group-hover/edit:opacity-100 text-muted-foreground transition-opacity" />
    </div>
  );
}

export function BankCard({ bank, index, onClick, onUpdateBalance, onUpdateBank }: BankCardProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const usagePercent = Math.min((bank.limitUsed / bank.limitTotal) * 100, 100);
  const isOverLimit = bank.limitUsed > bank.limitTotal;
  const freeAmount = bank.limitTotal - bank.limitUsed;

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(String(bank.limitUsed));
    setEditing(true);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const val = parseFloat(editValue);
    if (!isNaN(val) && val >= 0) onUpdateBalance(bank.id, val);
    setEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => { e.stopPropagation(); setEditing(false); };

  const cycleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateBank) return;
    const idx = statusOptions.indexOf(bank.status);
    onUpdateBank(bank.id, { status: statusOptions[(idx + 1) % statusOptions.length] });
  };

  return (
    <div
      onClick={editing ? undefined : onClick}
      className={`masonry-item w-full text-left glass-card-hover rounded-2xl p-5 cursor-pointer group animate-float-in ${bank.glowClass}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${bankBgAccent[bank.color] || ""} pointer-events-none`} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-${bank.color}/20 flex items-center justify-center`}>
              <CreditCard className={`w-5 h-5 text-${bank.color}`} />
            </div>
            <div>
              {onUpdateBank ? (
                <EditableField
                  value={bank.name}
                  onSave={(v) => onUpdateBank(bank.id, { name: v })}
                  className="font-semibold text-foreground"
                />
              ) : (
                <h3 className="font-semibold text-foreground">{bank.name}</h3>
              )}
              <p className="text-xs text-muted-foreground">{bank.installments.length} parcelas</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] cursor-pointer ${statusStyles[bank.status]}`}
            onClick={cycleStatus}
          >
            {statusLabels[bank.status]}
          </Badge>
        </div>

        {/* Limit bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Limite usado</span>
            <span>{usagePercent.toFixed(0)}%</span>
          </div>
          <Progress value={usagePercent} className={`h-2 bg-secondary ${bankProgressColor[bank.color] || ""}`} />
        </div>

        {/* Values */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Limite</p>
            {onUpdateBank ? (
              <EditableField
                value={bank.limitTotal}
                onSave={(v) => { const n = parseFloat(v); if (!isNaN(n) && n > 0) onUpdateBank(bank.id, { limitTotal: n } as any); }}
                type="number"
                prefix="R$ "
                className="text-money text-foreground"
              />
            ) : (
              <p className="text-money text-foreground">R$ {bank.limitTotal.toLocaleString("pt-BR")}</p>
            )}
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Usado</p>
            {editing ? (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <Input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-7 text-xs rounded-lg w-24" autoFocus />
                <button onClick={handleSave} className="p-1 rounded hover:bg-income/20 text-income"><Check className="w-3.5 h-3.5" /></button>
                <button onClick={handleCancel} className="p-1 rounded hover:bg-expense/20 text-expense"><X className="w-3.5 h-3.5" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 group/edit">
                <p className="text-money text-foreground">R$ {bank.limitUsed.toLocaleString("pt-BR")}</p>
                <button onClick={handleStartEdit} className="opacity-0 group-hover/edit:opacity-100 p-0.5 rounded hover:bg-secondary text-muted-foreground transition-opacity">
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Free amount / Over limit alert */}
        <div className="mt-3 pt-3 border-t border-border/50">
          {isOverLimit ? (
            <div className="flex items-center gap-2 text-expense animate-pulse-danger">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium">Limite excedido em R$ {Math.abs(freeAmount).toLocaleString("pt-BR")}</span>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Livre</span>
              <span className="text-sm text-money text-income">R$ {freeAmount.toLocaleString("pt-BR")}</span>
            </div>
          )}
        </div>

        {/* Debt */}
        <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Dívida Total</span>
          <span className="text-lg text-money text-foreground">R$ {bank.debtFinal.toLocaleString("pt-BR")}</span>
        </div>

        {/* Update balance button */}
        <button onClick={handleStartEdit} className="mt-3 w-full text-center text-xs text-primary/70 hover:text-primary py-1.5 rounded-lg hover:bg-primary/5 transition-colors">
          Atualizar Saldo
        </button>
      </div>
    </div>
  );
}
