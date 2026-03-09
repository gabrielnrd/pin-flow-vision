import { DebtTrackingChart } from "@/components/DebtTrackingChart";
import { FinancialFearGreedGauge } from "@/components/FinancialFearGreedGauge";
import { useFinanceStore } from "@/stores/financeStore";
import { TrendingDown, TrendingUp, Percent, CalendarDays } from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold text-foreground">{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

export default function DividaPage() {
  const store = useFinanceStore();

  const totalPaidExpenses = store.cashflowMonths.reduce(
    (sum, m) => sum + m.expenses.filter((e) => e.paid).reduce((s, e) => s + e.amount, 0),
    0
  );

  const monthsWithPayments = store.cashflowMonths.filter(
    (m) => m.expenses.some((e) => e.paid)
  ).length;

  const avgMonthly = monthsWithPayments > 0 ? totalPaidExpenses / monthsWithPayments : 0;
  const monthsToPayOff = avgMonthly > 0 ? Math.ceil(store.totalDebt / avgMonthly) : 0;

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8 max-w-[1600px] mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Dívida</h1>
        <p className="text-sm text-muted-foreground">Acompanhe a evolução e abatimento da sua dívida total</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingDown}
          label="Dívida Total"
          value={`R$ ${store.totalDebt.toLocaleString("pt-BR")}`}
          color="bg-destructive/10 text-destructive"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Abatido"
          value={`R$ ${totalPaidExpenses.toLocaleString("pt-BR")}`}
          color="bg-chart-2/10 text-chart-2"
        />
        <StatCard
          icon={Percent}
          label="Média Mensal"
          value={`R$ ${avgMonthly.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`}
          sub="de abatimento"
          color="bg-primary/10 text-primary"
        />
        <StatCard
          icon={CalendarDays}
          label="Previsão"
          value={monthsToPayOff > 0 ? `${monthsToPayOff} meses` : "—"}
          sub="para quitar"
          color="bg-accent/50 text-accent-foreground"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
        <DebtTrackingChart />
        <FinancialFearGreedGauge />
      </div>
    </div>
  );
}
