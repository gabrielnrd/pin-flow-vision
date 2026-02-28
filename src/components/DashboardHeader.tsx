import { TrendingDown, Wallet, CreditCard } from "lucide-react";

interface DashboardHeaderProps {
  totalDebt: number;
  expectedBalance: number;
  monthLabel: string;
}

export function DashboardHeader({ totalDebt, expectedBalance, monthLabel }: DashboardHeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">FinanceFlow</h1>
          <p className="text-muted-foreground text-sm mt-1">Sua visão financeira completa</p>
        </div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest">{monthLabel}</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-expense/15 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-expense" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Dívida Total</p>
            <p className="text-xl text-money text-expense">R$ {totalDebt.toLocaleString("pt-BR")}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-income/15 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-income" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Saldo Esperado</p>
            <p className={`text-xl text-money ${expectedBalance >= 0 ? "text-income" : "text-expense"}`}>
              R$ {expectedBalance.toLocaleString("pt-BR")}
            </p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Comprometido</p>
            <p className="text-xl text-money text-foreground">
              {totalDebt > 0 ? ((totalDebt / (totalDebt + Math.max(expectedBalance, 0))) * 100).toFixed(0) : 0}%
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
