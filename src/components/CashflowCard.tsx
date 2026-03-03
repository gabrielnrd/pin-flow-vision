import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Check, Plus, X, Pencil } from "lucide-react";
import { type CashflowMonth } from "@/data/financialData";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CashflowCardProps {
  cashflow: CashflowMonth;
  totalIncome: number;
  totalExpense: number;
  expectedBalance: number;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  monthIndex: number;
  onTogglePaid: (monthIdx: number, type: "incomes" | "expenses", itemIdx: number) => void;
  onAddItem: (monthIdx: number, type: "incomes" | "expenses", label: string, amount: number) => void;
  onRemoveItem: (monthIdx: number, type: "incomes" | "expenses", itemIdx: number) => void;
  onUpdateItem: (monthIdx: number, type: "incomes" | "expenses", itemIdx: number, label: string, amount: number) => void;
}

function EditableItem({
  item,
  idx,
  type,
  monthIndex,
  onTogglePaid,
  onRemoveItem,
  onUpdateItem,
}: {
  item: { label: string; amount: number; paid?: boolean };
  idx: number;
  type: "incomes" | "expenses";
  monthIndex: number;
  onTogglePaid: CashflowCardProps["onTogglePaid"];
  onRemoveItem: CashflowCardProps["onRemoveItem"];
  onUpdateItem: CashflowCardProps["onUpdateItem"];
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(item.label);
  const [amount, setAmount] = useState(String(item.amount));
  const isIncome = type === "incomes";

  const handleSave = () => {
    const val = parseFloat(amount);
    if (label.trim() && !isNaN(val) && val > 0) {
      onUpdateItem(monthIndex, type, idx, label.trim(), val);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1.5 text-sm">
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="h-7 text-xs rounded-lg flex-1"
          autoFocus
        />
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-7 text-xs rounded-lg w-24"
        />
        <button onClick={handleSave} className="p-1 rounded hover:bg-income/20 text-income">
          <Check className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setEditing(false)} className="p-1 rounded hover:bg-expense/20 text-expense">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm group">
      <Checkbox
        checked={item.paid}
        onCheckedChange={() => onTogglePaid(monthIndex, type, idx)}
        className={`h-4 w-4 rounded border-border ${isIncome ? "data-[state=checked]:bg-income data-[state=checked]:border-income" : "data-[state=checked]:bg-expense data-[state=checked]:border-expense"}`}
      />
      <span
        className={`flex-1 cursor-pointer hover:text-foreground transition-colors ${item.paid ? "text-muted-foreground line-through" : "text-muted-foreground"}`}
        onClick={() => { setLabel(item.label); setAmount(String(item.amount)); setEditing(true); }}
      >
        {item.label}
      </span>
      <span
        className={`text-money cursor-pointer hover:text-foreground transition-colors ${item.paid ? "text-muted-foreground line-through" : "text-foreground"}`}
        onClick={() => { setLabel(item.label); setAmount(String(item.amount)); setEditing(true); }}
      >
        R$ {item.amount.toLocaleString("pt-BR")}
      </span>
      {item.paid && <Check className={`w-3.5 h-3.5 ${isIncome ? "text-income" : "text-expense"}`} />}
      <button
        onClick={() => onRemoveItem(monthIndex, type, idx)}
        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-expense/20 text-muted-foreground hover:text-expense transition-all"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

function AddItemRow({ type, monthIndex, onAdd }: {
  type: "incomes" | "expenses";
  monthIndex: number;
  onAdd: CashflowCardProps["onAddItem"];
}) {
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");

  const handleAdd = () => {
    const val = parseFloat(amount);
    if (label.trim() && !isNaN(val) && val > 0) {
      onAdd(monthIndex, type, label.trim(), val);
      setLabel("");
      setAmount("");
      setAdding(false);
    }
  };

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mt-1"
      >
        <Plus className="w-3 h-3" /> Adicionar {type === "incomes" ? "entrada" : "saída"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 mt-1">
      <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Descrição" className="h-7 text-xs rounded-lg flex-1" autoFocus />
      <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Valor" className="h-7 text-xs rounded-lg w-24" />
      <button onClick={handleAdd} className="p-1 rounded hover:bg-income/20 text-income"><Check className="w-3.5 h-3.5" /></button>
      <button onClick={() => setAdding(false)} className="p-1 rounded hover:bg-expense/20 text-expense"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
}

export function CashflowCard({
  cashflow, totalIncome, totalExpense, expectedBalance,
  onPrev, onNext, canPrev, canNext, monthIndex,
  onTogglePaid, onAddItem, onRemoveItem, onUpdateItem,
}: CashflowCardProps) {
  return (
    <div className="masonry-item glass-card rounded-2xl p-5 animate-float-in">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Fluxo de Caixa</h3>
        <div className="flex items-center gap-1">
          <button onClick={onPrev} disabled={!canPrev} className="p-1 rounded-lg hover:bg-secondary disabled:opacity-30 transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-sm font-semibold text-foreground px-2 min-w-[100px] text-center">
            {cashflow.month} {cashflow.year}
          </span>
          <button onClick={onNext} disabled={!canNext} className="p-1 rounded-lg hover:bg-secondary disabled:opacity-30 transition-colors">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="text-center mb-5 py-4 rounded-xl bg-secondary/50">
        <p className="text-xs text-muted-foreground mb-1">Saldo Esperado</p>
        <p className={`text-3xl text-money ${expectedBalance >= 0 ? "text-income" : "text-expense"}`}>
          R$ {expectedBalance.toLocaleString("pt-BR")}
        </p>
      </div>

      {/* Income */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <ArrowUpRight className="w-4 h-4 text-income" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Entradas</span>
          <span className="ml-auto text-sm text-money text-income">R$ {totalIncome.toLocaleString("pt-BR")}</span>
        </div>
        <div className="space-y-1.5">
          {cashflow.incomes.map((item, idx) => (
            <EditableItem key={`${item.label}-${idx}`} item={item} idx={idx} type="incomes" monthIndex={monthIndex} onTogglePaid={onTogglePaid} onRemoveItem={onRemoveItem} onUpdateItem={onUpdateItem} />
          ))}
          <AddItemRow type="incomes" monthIndex={monthIndex} onAdd={onAddItem} />
        </div>
      </div>

      {/* Expenses */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <ArrowDownRight className="w-4 h-4 text-expense" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Saídas</span>
          <span className="ml-auto text-sm text-money text-expense">R$ {totalExpense.toLocaleString("pt-BR")}</span>
        </div>
        <div className="space-y-1.5">
          {cashflow.expenses.map((item, idx) => (
            <EditableItem key={`${item.label}-${idx}`} item={item} idx={idx} type="expenses" monthIndex={monthIndex} onTogglePaid={onTogglePaid} onRemoveItem={onRemoveItem} onUpdateItem={onUpdateItem} />
          ))}
          <AddItemRow type="expenses" monthIndex={monthIndex} onAdd={onAddItem} />
        </div>
      </div>
    </div>
  );
}
