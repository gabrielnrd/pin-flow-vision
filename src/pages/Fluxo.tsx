import { useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Plus, Wallet } from "lucide-react";
import { useFinanceStore } from "@/stores/financeStore";
import { CashflowCard } from "@/components/CashflowCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EXPENSE_CATEGORIES, getCategory, suggestCategory } from "@/data/categories";
import { toast } from "@/hooks/use-toast";

/** Quick entry panel for debit / cash movements of the selected month. */
function QuickEntryPanel() {
  const { selectedMonth, currentCashflow, addCashflowItem, expectedBalance } = useFinanceStore();
  const [kind, setKind] = useState<"expenses" | "income">("expenses");
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("outros");
  const [origin, setOrigin] = useState("Débito");

  const handleAdd = () => {
    const val = parseFloat(amount);
    if (!label.trim() || isNaN(val) || val <= 0) return;
    const prefix = kind === "expenses" ? `${origin} — ` : "";
    addCashflowItem(selectedMonth, kind, `${prefix}${label.trim()}`, val, kind === "expenses" ? category : undefined);
    const cat = getCategory(category);
    toast({
      title: kind === "expenses" ? "Saída registrada" : "Entrada registrada",
      description: `${kind === "expenses" ? cat.emoji : "💰"} ${label} • R$ ${val.toLocaleString("pt-BR")} em ${currentCashflow.month}`,
    });
    setLabel(""); setAmount(""); setCategory("outros");
  };

  const projected = expectedBalance + (kind === "income" ? 1 : -1) * (parseFloat(amount) || 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Wallet className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Lançamento rápido — débito & dinheiro</h3>
      </div>

      <div className="flex gap-1.5">
        <button
          onClick={() => setKind("expenses")}
          className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-medium border transition-colors ${kind === "expenses" ? "border-expense text-expense bg-expense/10" : "border-border text-muted-foreground hover:text-foreground"}`}
        >
          <ArrowDownCircle className="w-3.5 h-3.5" /> Saída
        </button>
        <button
          onClick={() => setKind("income")}
          className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-medium border transition-colors ${kind === "income" ? "border-income text-income bg-income/10" : "border-border text-muted-foreground hover:text-foreground"}`}
        >
          <ArrowUpCircle className="w-3.5 h-3.5" /> Entrada
        </button>
      </div>

      <Input
        value={label}
        onChange={(e) => {
          setLabel(e.target.value);
          if (kind === "expenses" && e.target.value.length >= 3) {
            const s = suggestCategory(e.target.value);
            if (s !== "outros") setCategory(s);
          }
        }}
        placeholder={kind === "expenses" ? "Descrição (ex: Supermercado)" : "Descrição (ex: Freela)"}
        className="rounded-lg h-9 text-sm"
      />

      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Valor"
          min={0}
          className="rounded-lg h-9 text-sm"
        />
        {kind === "expenses" ? (
          <Select value={origin} onValueChange={setOrigin}>
            <SelectTrigger className="h-9 rounded-lg text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Débito">Débito</SelectItem>
              <SelectItem value="Pix">Pix</SelectItem>
              <SelectItem value="Dinheiro">Dinheiro</SelectItem>
              <SelectItem value="Boleto">Boleto</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="flex items-center px-3 rounded-lg border border-border text-xs text-muted-foreground">
            {currentCashflow.month} {currentCashflow.year}
          </div>
        )}
      </div>

      {kind === "expenses" && (
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-9 rounded-lg text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.emoji} {c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] text-muted-foreground">
          Saldo final após lançar:{" "}
          <span className={`text-money ${projected < 0 ? "text-expense" : "text-income"}`}>
            R$ {projected.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
          </span>
        </p>
        <Button size="sm" className="rounded-lg gap-1.5" onClick={handleAdd}>
          <Plus className="w-3.5 h-3.5" /> Lançar
        </Button>
      </div>
    </div>
  );
}

const FluxoPage = () => {
  const store = useFinanceStore();

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-8 sm:px-8 lg:px-12 max-w-[1440px] mx-auto pb-28 md:pb-16">
        <header className="mb-8">
          <span className="label-mono">Fluxo de caixa</span>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mt-1">
            Fluxo do Mês
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Todas as entradas e saídas de {store.currentCashflow.month} {store.currentCashflow.year} — débito, pix, dinheiro e cartão, integrados às projeções.
          </p>
          <div className="hairline mt-5" />
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4 items-start">
          <div key={`cf-${store.selectedMonth}`} className="animate-float-in">
            <CashflowCard
              cashflow={store.currentCashflow}
              totalIncome={store.totalIncome}
              totalExpense={store.totalExpense}
              cardExpensesForMonth={store.cardExpensesForMonth}
              expectedBalance={store.expectedBalance}
              onPrev={store.prevMonth}
              onNext={store.nextMonth}
              canPrev={store.selectedMonth > 0}
              canNext={store.selectedMonth < store.cashflowMonths.length - 1}
              monthIndex={store.selectedMonth}
              onTogglePaid={store.toggleCashflowPaid}
              onAddItem={store.addCashflowItem}
              onRemoveItem={store.removeCashflowItem}
              onUpdateItem={store.updateCashflowItem}
              onSetFixed={store.setCashflowItemFixed}
              onReplicateFixed={store.replicateFixedItem}
            />
          </div>
          <QuickEntryPanel />
        </div>
      </div>
    </div>
  );
};

export default FluxoPage;
