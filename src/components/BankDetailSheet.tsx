import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { CreditCard, AlertTriangle, Pencil, Check, X, Trash2, Plus, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Bank, type Installment, type BankId } from "@/data/financialData";
import { CardColorPicker } from "@/components/CardColorPicker";
import { getCardColor } from "@/data/cardColors";

interface BankDetailSheetProps {
  bank: Bank | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateInstallment: (bankId: BankId, installmentId: string, updates: Partial<Omit<Installment, "id">>) => void;
  onRemoveInstallment: (bankId: BankId, installmentId: string) => void;
  onAddInstallment: (bankId: BankId, inst: Omit<Installment, "id">) => void;
  onUpdateBank?: (bankId: BankId, updates: Partial<Pick<Bank, "name" | "limitTotal" | "status" | "color" | "glowClass">>) => void;
  onRemoveBank?: (bankId: BankId) => void;
}

const statusStyles = {
  pendente: "bg-expense/20 text-expense border-expense/30",
  pago: "bg-income/20 text-income border-income/30",
  atrasado: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const statusCycle: Installment["status"][] = ["pendente", "pago", "atrasado"];

function EditableInstallment({ inst, bankId, onUpdate, onRemove, onDuplicate }: {
  inst: Installment;
  bankId: BankId;
  onUpdate: BankDetailSheetProps["onUpdateInstallment"];
  onRemove: BankDetailSheetProps["onRemoveInstallment"];
  onDuplicate: (inst: Installment) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [desc, setDesc] = useState(inst.description);
  const [amount, setAmount] = useState(String(inst.installmentAmount));
  const [total, setTotal] = useState(String(inst.totalAmount));
  const [current, setCurrent] = useState(String(inst.currentInstallment));
  const [totalInst, setTotalInst] = useState(String(inst.totalInstallments));
  const [due, setDue] = useState(inst.dueDate);

  const handleSave = () => {
    const a = parseFloat(amount);
    const t = parseFloat(total);
    const c = parseInt(current);
    const ti = parseInt(totalInst);
    if (desc.trim() && !isNaN(a) && !isNaN(t) && !isNaN(c) && !isNaN(ti) && due) {
      onUpdate(bankId, inst.id, { description: desc.trim(), installmentAmount: a, totalAmount: t, currentInstallment: c, totalInstallments: ti, dueDate: due });
    }
    setEditing(false);
  };

  const cycleStatus = () => {
    const idx = statusCycle.indexOf(inst.status);
    onUpdate(bankId, inst.id, { status: statusCycle[(idx + 1) % statusCycle.length] });
  };

  if (editing) {
    return (
      <div className="p-4 rounded-xl bg-secondary/40 space-y-2">
        <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descrição" className="h-7 text-xs rounded-lg" autoFocus />
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Valor parcela" className="h-7 text-xs rounded-lg" />
          <Input type="number" value={total} onChange={(e) => setTotal(e.target.value)} placeholder="Valor total" className="h-7 text-xs rounded-lg" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Input type="number" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Parcela atual" className="h-7 text-xs rounded-lg" />
          <Input type="number" value={totalInst} onChange={(e) => setTotalInst(e.target.value)} placeholder="Total parcelas" className="h-7 text-xs rounded-lg" />
          <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="h-7 text-xs rounded-lg" />
        </div>
        <div className="flex gap-1 justify-end">
          <button onClick={handleSave} className="p-1 rounded hover:bg-income/20 text-income"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={() => setEditing(false)} className="p-1 rounded hover:bg-expense/20 text-expense"><X className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition-colors group">
      <div className="flex justify-between items-start mb-2">
        <div className="cursor-pointer" onClick={() => { setDesc(inst.description); setAmount(String(inst.installmentAmount)); setTotal(String(inst.totalAmount)); setCurrent(String(inst.currentInstallment)); setTotalInst(String(inst.totalInstallments)); setDue(inst.dueDate); setEditing(true); }}>
          <p className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            {inst.description}
            <Pencil className="w-3 h-3 inline ml-1.5 opacity-0 group-hover:opacity-50" />
          </p>
          <p className="text-xs text-muted-foreground">
            Parcela {inst.currentInstallment} de {inst.totalInstallments}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Badge
            variant="outline"
            className={`text-[10px] cursor-pointer ${statusStyles[inst.status]}`}
            onClick={cycleStatus}
          >
            {inst.status === "pago" ? "Pago" : inst.status === "atrasado" ? "Atrasado" : "Pendente"}
          </Badge>
          <button
            onClick={() => onDuplicate(inst)}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all"
            title="Duplicar fatura"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button onClick={() => onRemove(bankId, inst.id)} className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-expense/20 text-muted-foreground hover:text-expense transition-all">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs text-muted-foreground">Vencimento</p>
          <p className="text-sm text-foreground">
            {new Date(inst.dueDate + "T00:00:00").toLocaleDateString("pt-BR")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Valor da Parcela</p>
          <p className="text-lg text-money text-foreground">
            R$ {inst.installmentAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-border/30">
        <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
          <span>Progresso</span>
          <span>{((inst.currentInstallment / inst.totalInstallments) * 100).toFixed(0)}%</span>
        </div>
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(inst.currentInstallment / inst.totalInstallments) * 100}%` }} />
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Total: R$ {inst.totalAmount.toLocaleString("pt-BR")}
        </p>
      </div>
    </div>
  );
}

function AddInstallmentRow({ bankId, onAdd }: { bankId: BankId; onAdd: BankDetailSheetProps["onAddInstallment"] }) {
  const [adding, setAdding] = useState(false);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [totalAmt, setTotalAmt] = useState("");
  const [totalInst, setTotalInst] = useState("12");
  const [due, setDue] = useState("");

  const handleAdd = () => {
    const a = parseFloat(amount);
    const t = parseFloat(totalAmt);
    const ti = parseInt(totalInst);
    if (desc.trim() && !isNaN(a) && !isNaN(t) && !isNaN(ti) && due) {
      onAdd(bankId, { description: desc.trim(), installmentAmount: a, totalAmount: t, currentInstallment: 1, totalInstallments: ti, dueDate: due, status: "pendente" });
      setDesc(""); setAmount(""); setTotalAmt(""); setTotalInst("12"); setDue("");
      setAdding(false);
    }
  };

  if (!adding) return (
    <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mt-3">
      <Plus className="w-3 h-3" /> Adicionar parcela
    </button>
  );

  return (
    <div className="p-3 rounded-xl bg-secondary/30 space-y-2 mt-3">
      <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descrição" className="h-7 text-xs rounded-lg" autoFocus />
      <div className="grid grid-cols-2 gap-2">
        <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Valor parcela" className="h-7 text-xs rounded-lg" />
        <Input type="number" value={totalAmt} onChange={(e) => setTotalAmt(e.target.value)} placeholder="Valor total" className="h-7 text-xs rounded-lg" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input type="number" value={totalInst} onChange={(e) => setTotalInst(e.target.value)} placeholder="Nº parcelas" className="h-7 text-xs rounded-lg" />
        <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="h-7 text-xs rounded-lg" />
      </div>
      <div className="flex gap-1 justify-end">
        <button onClick={handleAdd} className="p-1 rounded hover:bg-income/20 text-income"><Check className="w-3.5 h-3.5" /></button>
        <button onClick={() => setAdding(false)} className="p-1 rounded hover:bg-expense/20 text-expense"><X className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

export function BankDetailSheet({ bank, open, onOpenChange, onUpdateInstallment, onRemoveInstallment, onAddInstallment, onUpdateBank, onRemoveBank }: BankDetailSheetProps) {
  if (!bank) return null;

  const isOverLimit = bank.limitUsed > bank.limitTotal;
  const freeAmount = bank.limitTotal - bank.limitUsed;

  const handleDuplicate = (inst: Installment) => {
    onAddInstallment(bank.id, {
      description: `${inst.description} (cópia)`,
      installmentAmount: inst.installmentAmount,
      totalAmount: inst.totalAmount,
      currentInstallment: inst.currentInstallment,
      totalInstallments: inst.totalInstallments,
      dueDate: inst.dueDate,
      status: "pendente",
    });
  };

  const handleColorChange = (colorId: string, glow: string) => {
    if (onUpdateBank) onUpdateBank(bank.id, { color: colorId, glowClass: glow });
  };

  const handleDeleteBank = () => {
    if (onRemoveBank) {
      onRemoveBank(bank.id);
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="glass-card border-l-border/30 w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-${bank.color}/20 flex items-center justify-center`}>
              <CreditCard className={`w-6 h-6 text-${bank.color}`} />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-foreground text-lg">{bank.name}</SheetTitle>
              <p className="text-sm text-muted-foreground">{bank.installments.length} parcelas registradas</p>
            </div>
          </div>
        </SheetHeader>

        {/* Category selector */}
        {onUpdateBank && (
          <div className="mb-4">
            <CardColorPicker value={bank.color} onChange={handleColorChange} />
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-secondary/50">
            <p className="text-xs text-muted-foreground">Limite Total</p>
            <p className="text-base font-bold text-foreground">R$ {bank.limitTotal.toLocaleString("pt-BR")}</p>
          </div>
          <div className="p-3 rounded-xl bg-secondary/50">
            <p className="text-xs text-muted-foreground">Usado</p>
            <p className={`text-base font-bold ${isOverLimit ? "text-expense" : "text-foreground"}`}>
              R$ {bank.limitUsed.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className={`p-3 rounded-xl ${isOverLimit ? "bg-expense/10 border border-expense/20" : "bg-income/10 border border-income/20"}`}>
            <p className="text-xs text-muted-foreground">{isOverLimit ? "Excedido" : "Livre"}</p>
            <p className={`text-base font-bold ${isOverLimit ? "text-expense" : "text-income"}`}>
              R$ {Math.abs(freeAmount).toLocaleString("pt-BR")}
            </p>
          </div>
        </div>

        {isOverLimit && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-expense/10 border border-expense/20 mb-6 animate-pulse-danger">
            <AlertTriangle className="w-5 h-5 text-expense" />
            <span className="text-sm text-expense font-medium">
              Limite excedido em R$ {(bank.limitUsed - bank.limitTotal).toLocaleString("pt-BR")}
            </span>
          </div>
        )}

        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Parcelas
        </h4>
        <div className="space-y-2">
          {[...bank.installments].sort((a, b) => {
            if (a.status === "pago" && b.status !== "pago") return 1;
            if (a.status !== "pago" && b.status === "pago") return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          }).map((inst) => (
            <EditableInstallment
              key={inst.id}
              inst={inst}
              bankId={bank.id}
              onUpdate={onUpdateInstallment}
              onRemove={onRemoveInstallment}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>

        <AddInstallmentRow bankId={bank.id} onAdd={onAddInstallment} />

        {/* Delete bank button */}
        {onRemoveBank && (
          <div className="mt-8 pt-4 border-t border-border/30">
            <Button variant="destructive" className="w-full" onClick={handleDeleteBank}>
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Cartão
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
