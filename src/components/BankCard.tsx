import { useState } from "react";
import { type Bank, type BankId } from "@/data/financialData";
import { CreditCard, AlertTriangle, Pencil, Check, X, Wifi } from "lucide-react";
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

const bankGradients: Record<string, string> = {
  "bank-nubank": "from-[hsl(280,97%,38%)] to-[hsl(300,80%,25%)]",
  "bank-inter": "from-[hsl(27,100%,50%)] to-[hsl(15,90%,40%)]",
  "bank-c6": "from-[hsl(220,10%,20%)] to-[hsl(220,15%,12%)]",
  "bank-itau": "from-[hsl(27,85%,47%)] to-[hsl(220,50%,30%)]",
  "bank-bb": "from-[hsl(45,100%,45%)] to-[hsl(45,80%,30%)]",
};

const bankTextColor: Record<string, string> = {
  "bank-nubank": "text-white",
  "bank-inter": "text-white",
  "bank-c6": "text-gray-300",
  "bank-itau": "text-white",
  "bank-bb": "text-gray-900",
};

const bankProgressColor: Record<string, string> = {
  "bank-nubank": "[&>div]:bg-white/80",
  "bank-inter": "[&>div]:bg-white/80",
  "bank-c6": "[&>div]:bg-white/60",
  "bank-itau": "[&>div]:bg-white/80",
  "bank-bb": "[&>div]:bg-gray-900/60",
};

const statusOptions: Bank["status"][] = ["pendente", "pago", "parcial"];

export function BankCard({ bank, index, onClick, onUpdateBalance, onUpdateBank }: BankCardProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [editingLimit, setEditingLimit] = useState(false);
  const [editLimit, setEditLimit] = useState("");

  const usagePercent = Math.min((bank.limitUsed / bank.limitTotal) * 100, 100);
  const isOverLimit = bank.limitUsed > bank.limitTotal;
  const freeAmount = bank.limitTotal - bank.limitUsed;

  const gradient = bankGradients[bank.color] || "from-primary to-accent";
  const textColor = bankTextColor[bank.color] || "text-white";
  const progressColor = bankProgressColor[bank.color] || "[&>div]:bg-white/80";

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

  // Last 4 digits visual
  const cardNumber = `•••• •••• •••• ${String(Math.abs(bank.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 10000)).padStart(4, "0")}`;

  return (
    <div
      onClick={editing || editingName || editingLimit ? undefined : onClick}
      className={`masonry-item w-full text-left rounded-2xl cursor-pointer group animate-float-in overflow-hidden ${isOverLimit ? "animate-over-limit" : ""}`}
      style={{ animationDelay: `${index * 80}ms`, aspectRatio: "1.586/1" }}
    >
      {/* Credit card body */}
      <div className={`relative w-full h-full bg-gradient-to-br ${gradient} p-5 flex flex-col justify-between ${textColor}`}>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />

        {/* Top row: Bank name + status + contactless */}
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex-1">
            {editingName ? (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-7 text-sm rounded-lg w-32 bg-black/20 border-white/20 text-white placeholder:text-white/50"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { onUpdateBank?.(bank.id, { name: editName }); setEditingName(false); }
                    if (e.key === "Escape") setEditingName(false);
                  }}
                />
                <button onClick={(e) => { e.stopPropagation(); onUpdateBank?.(bank.id, { name: editName }); setEditingName(false); }} className="p-1"><Check className="w-3.5 h-3.5" /></button>
                <button onClick={(e) => { e.stopPropagation(); setEditingName(false); }} className="p-1"><X className="w-3.5 h-3.5" /></button>
              </div>
            ) : (
              <div
                className="flex items-center gap-1.5 group/name"
                onClick={(e) => { if (onUpdateBank) { e.stopPropagation(); setEditName(bank.name); setEditingName(true); } }}
              >
                <h3 className="font-bold text-lg tracking-wide">{bank.name}</h3>
                {onUpdateBank && <Pencil className="w-3 h-3 opacity-0 group-hover/name:opacity-60 transition-opacity" />}
              </div>
            )}
            <p className="text-[10px] opacity-60 mt-0.5">{bank.installments.length} parcelas ativas</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-[10px] cursor-pointer border-white/30 ${statusStyles[bank.status]}`}
              onClick={cycleStatus}
            >
              {statusLabels[bank.status]}
            </Badge>
            <Wifi className="w-5 h-5 opacity-40 rotate-90" />
          </div>
        </div>

        {/* Chip + Card Number */}
        <div className="relative z-10 flex items-center gap-3 my-auto">
          <div className="w-10 h-7 rounded-md bg-gradient-to-br from-yellow-300/80 to-yellow-600/80 border border-yellow-400/40" />
          <span className="text-sm font-mono tracking-[0.2em] opacity-80">{cardNumber}</span>
        </div>

        {/* Bottom: Financial info */}
        <div className="relative z-10 space-y-2">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-[10px] opacity-70 mb-1">
              <span>Limite usado</span>
              <span>{usagePercent.toFixed(0)}%</span>
            </div>
            <Progress value={usagePercent} className={`h-1.5 bg-white/20 ${progressColor}`} />
          </div>

          {/* Values row */}
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] opacity-60">Limite</p>
              {editingLimit ? (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Input
                    type="number"
                    value={editLimit}
                    onChange={(e) => setEditLimit(e.target.value)}
                    className="h-6 text-xs rounded w-20 bg-black/20 border-white/20 text-white"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { const n = parseFloat(editLimit); if (!isNaN(n) && n > 0) onUpdateBank?.(bank.id, { limitTotal: n } as any); setEditingLimit(false); }
                      if (e.key === "Escape") setEditingLimit(false);
                    }}
                  />
                </div>
              ) : (
                <p
                  className="text-sm font-bold tabular-nums cursor-pointer group/limit flex items-center gap-1"
                  onClick={(e) => { if (onUpdateBank) { e.stopPropagation(); setEditLimit(String(bank.limitTotal)); setEditingLimit(true); } }}
                >
                  R$ {bank.limitTotal.toLocaleString("pt-BR")}
                  {onUpdateBank && <Pencil className="w-2.5 h-2.5 opacity-0 group-hover/limit:opacity-60 transition-opacity" />}
                </p>
              )}
            </div>

            <div className="text-right">
              <p className="text-[10px] opacity-60">Usado</p>
              {editing ? (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-6 text-xs rounded w-20 bg-black/20 border-white/20 text-white" autoFocus />
                  <button onClick={handleSave} className="p-0.5"><Check className="w-3 h-3" /></button>
                  <button onClick={handleCancel} className="p-0.5"><X className="w-3 h-3" /></button>
                </div>
              ) : (
                <p
                  className="text-sm font-bold tabular-nums cursor-pointer group/used flex items-center gap-1"
                  onClick={handleStartEdit}
                >
                  R$ {bank.limitUsed.toLocaleString("pt-BR")}
                  <Pencil className="w-2.5 h-2.5 opacity-0 group-hover/used:opacity-60 transition-opacity" />
                </p>
              )}
            </div>

            <div className="text-right">
              {isOverLimit ? (
                <div className="flex items-center gap-1 animate-pulse-danger">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <div>
                    <p className="text-[10px] opacity-60">Excedido</p>
                    <p className="text-sm font-bold tabular-nums">R$ {Math.abs(freeAmount).toLocaleString("pt-BR")}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-[10px] opacity-60">Livre</p>
                  <p className="text-sm font-bold tabular-nums">R$ {freeAmount.toLocaleString("pt-BR")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Debt total */}
          <div className="flex justify-between items-center pt-1 border-t border-white/10">
            <span className="text-[10px] opacity-60">Dívida Total</span>
            <span className="text-base font-bold tabular-nums">R$ {bank.debtFinal.toLocaleString("pt-BR")}</span>
          </div>
        </div>

        {/* Brand icon bottom-right */}
        <div className="absolute bottom-4 right-5 opacity-20">
          <CreditCard className="w-10 h-10" />
        </div>
      </div>
    </div>
  );
}
