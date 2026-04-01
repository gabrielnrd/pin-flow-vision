import { useState, useMemo } from "react";
import { ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Check, Plus, X, Pencil, Filter } from "lucide-react";
import { type CashflowMonth } from "@/data/financialData";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CashflowCardProps {
  cashflow: CashflowMonth;
  totalIncome: number;
  totalExpense: number;
  cardExpensesForMonth: number;
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

const FIXED_LABELS = ["aluguel", "parcelas cartões", "luz", "água", "internet", "condomínio", "seguro", "plano de saúde"];
const VARIABLE_LABELS = ["alimentação", "transporte", "lazer", "ifood", "uber", "99", "roupas", "assinatura"];

type ExpenseFilter = "todas" | "fixas" | "variáveis";

function classifyExpense(label: string): "fixa" | "variável" {
  const lower = label.toLowerCase();
  if (FIXED_LABELS.some((f) => lower.includes(f))) return "fixa";
  return "variável";
}

function ExpenseSection({ cashflow, totalExpense, monthIndex, onTogglePaid, onRemoveItem, onUpdateItem, onAddItem }: {
  cashflow: CashflowMonth;
  totalExpense: number;
  monthIndex: number;
  onTogglePaid: CashflowCardProps["onTogglePaid"];
  onRemoveItem: CashflowCardProps["onRemoveItem"];
  onUpdateItem: CashflowCardProps["onUpdateItem"];
  onAddItem: CashflowCardProps["onAddItem"];
}) {
  const [filter, setFilter] = useState<ExpenseFilter>("todas");

  const filtered = useMemo(() => {
    if (filter === "todas") return cashflow.expenses.map((item, idx) => ({ item, idx }));
    const target = filter === "fixas" ? "fixa" : "variável";
    return cashflow.expenses
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => classifyExpense(item.label) === target);
  }, [cashflow.expenses, filter]);

  const filteredTotal = filtered.reduce((s, { item }) => s + item.amount, 0);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <ArrowDownRight className="w-4 h-4 text-expense" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Saídas</span>
        <span className="ml-auto text-sm text-money text-expense">R$ {filteredTotal.toLocaleString("pt-BR")}</span>
      </div>
      <div className="flex gap-1.5 mb-2">
        {(["todas", "fixas", "variáveis"] as ExpenseFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1 text-[10px] rounded-lg font-medium transition-colors ${filter === f ? "bg-primary/20 text-primary" : "bg-secondary/50 text-muted-foreground hover:text-foreground"}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div className="space-y-1.5">
        {filtered.map(({ item, idx }) => (
          <EditableItem key={`${item.label}-${idx}`} item={item} idx={idx} type="expenses" monthIndex={monthIndex} onTogglePaid={onTogglePaid} onRemoveItem={onRemoveItem} onUpdateItem={onUpdateItem} />
        ))}
        <AddItemRow type="expenses" monthIndex={monthIndex} onAdd={onAddItem} />
      </div>
    </div>
  );
}
export function CashflowCard({
  cashflow, totalIncome, totalExpense, cardExpensesForMonth, expectedBalance,
  onPrev, onNext, canPrev, canNext, monthIndex,
  onTogglePaid, onAddItem, onRemoveItem, onUpdateItem,
}: CashflowCardProps) {
  return (
    <div className="glass-card rounded-2xl p-5 animate-float-in">
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

      <div className="text-center mb-5 py-4 rounded-xl bg-secondary/50 relative overflow-hidden group/balance">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent opacity-0 group-hover/balance:opacity-100 transition-opacity duration-500" />
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

      {/* Card-based expenses */}
      {cardExpensesForMonth > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-expense/5 border border-expense/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <ArrowDownRight className="w-3.5 h-3.5 text-expense" />
              Parcelas dos Cartões (automático)
            </span>
            <span className="text-expense font-medium">R$ {cardExpensesForMonth.toLocaleString("pt-BR")}</span>
          </div>
        </div>
      )}

      {/* Manual Expenses with filters */}
      <ExpenseSection
        cashflow={cashflow}
        totalExpense={totalExpense}
        monthIndex={monthIndex}
        onTogglePaid={onTogglePaid}
        onRemoveItem={onRemoveItem}
        onUpdateItem={onUpdateItem}
        onAddItem={onAddItem}
      />
    </div>
  );
}
