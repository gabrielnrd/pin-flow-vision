import { ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight } from "lucide-react";
import { type CashflowMonth } from "@/data/financialData";

interface CashflowCardProps {
  cashflow: CashflowMonth;
  totalIncome: number;
  totalExpense: number;
  expectedBalance: number;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}

export function CashflowCard({
  cashflow,
  totalIncome,
  totalExpense,
  expectedBalance,
  onPrev,
  onNext,
  canPrev,
  canNext,
}: CashflowCardProps) {
  return (
    <div className="masonry-item glass-card rounded-2xl p-5 animate-float-in">
      {/* Header with month nav */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Fluxo de Caixa</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            disabled={!canPrev}
            className="p-1 rounded-lg hover:bg-secondary disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-sm font-semibold text-foreground px-2 min-w-[100px] text-center">
            {cashflow.month} {cashflow.year}
          </span>
          <button
            onClick={onNext}
            disabled={!canNext}
            className="p-1 rounded-lg hover:bg-secondary disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Expected balance hero */}
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
          <span className="ml-auto text-sm text-money text-income">
            R$ {totalIncome.toLocaleString("pt-BR")}
          </span>
        </div>
        <div className="space-y-1.5">
          {cashflow.incomes.map((item) => (
            <div key={item.label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="text-foreground text-money">R$ {item.amount.toLocaleString("pt-BR")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expenses */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <ArrowDownRight className="w-4 h-4 text-expense" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Saídas</span>
          <span className="ml-auto text-sm text-money text-expense">
            R$ {totalExpense.toLocaleString("pt-BR")}
          </span>
        </div>
        <div className="space-y-1.5">
          {cashflow.expenses.map((item) => (
            <div key={item.label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="text-foreground text-money">R$ {item.amount.toLocaleString("pt-BR")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
