import { useMemo } from "react";
import { useFinanceStore } from "@/stores/financeStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Bar,
  BarChart,
  ComposedChart,
  Legend,
} from "recharts";
import { TrendingDown } from "lucide-react";

const MONTH_MAP: Record<string, number> = {
  Janeiro: 0, Fevereiro: 1, Março: 2, Abril: 3, Maio: 4, Junho: 5,
  Julho: 6, Agosto: 7, Setembro: 8, Outubro: 9, Novembro: 10, Dezembro: 11,
};

const SHORT_MONTH = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function DebtTrackingChart() {
  const store = useFinanceStore();

  const chartData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Calculate initial total debt (bank installments not paid + creditors remaining)
    const initialBankDebt = store.banks.reduce((sum, b) => {
      return sum + b.installments
        .filter((inst) => inst.status !== "pago")
        .reduce((s, inst) => s + inst.installmentAmount * (inst.totalInstallments - inst.currentInstallment + 1), 0);
    }, 0);

    const creditorsRemaining = store.totalCreditorsDebt - store.totalCreditorsPaid;
    let runningDebt = initialBankDebt + creditorsRemaining;

    return store.cashflowMonths.map((m, idx) => {
      const mIdx = MONTH_MAP[m.month] ?? idx;
      const isPast = m.year < currentYear || (m.year === currentYear && mIdx <= currentMonth);

      // Sum paid expenses for this month (represents debt payments / abatements)
      const paidExpenses = m.expenses
        .filter((e) => e.paid)
        .reduce((s, e) => s + e.amount, 0);

      // Sum all expenses for projection
      const totalExpenses = m.expenses.reduce((s, e) => s + e.amount, 0);

      const abatimento = isPast ? paidExpenses : totalExpenses;

      runningDebt = Math.max(runningDebt - abatimento, 0);

      const label = `${SHORT_MONTH[mIdx] ?? m.month.slice(0, 3)}`;

      return {
        name: label,
        saldoDevedor: runningDebt,
        abatimento,
        isPast,
        isNegative: runningDebt > 0,
      };
    });
  }, [store.cashflowMonths, store.banks, store.totalCreditorsDebt, store.totalCreditorsPaid]);

  const totalDebt = store.totalDebt;
  const lastDebt = chartData.length > 0 ? chartData[chartData.length - 1].saldoDevedor : 0;
  const reductionPercent = totalDebt > 0 ? Math.round(((totalDebt - lastDebt) / totalDebt) * 100) : 0;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
              <TrendingDown className="w-4.5 h-4.5 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold tracking-tight">Evolução da Dívida</CardTitle>
              <p className="text-xs text-muted-foreground">
                Acompanhe a redução mês a mês
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">
              R$ {totalDebt.toLocaleString("pt-BR")}
            </p>
            <p className="text-xs text-muted-foreground">
              Projeção: <span className="text-chart-2 font-semibold">-{reductionPercent}%</span> até dez
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {/* Debt balance area chart */}
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="debtGradientRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="debtGradientGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<DebtTooltip />} />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" opacity={0.5} />
              <Area
                type="monotone"
                dataKey="saldoDevedor"
                stroke="hsl(var(--destructive))"
                strokeWidth={2.5}
                fill="url(#debtGradientRed)"
                dot={false}
                activeDot={{ r: 5, fill: "hsl(var(--destructive))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
              />
              <Bar
                dataKey="abatimento"
                fill="hsl(var(--chart-2))"
                opacity={0.6}
                radius={[4, 4, 0, 0]}
                barSize={18}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-destructive/70" />
            <span>Saldo Devedor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(var(--chart-2))" }} />
            <span>Abatimento Mensal</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DebtTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-popover/95 backdrop-blur-md border border-border rounded-xl px-4 py-3 shadow-xl">
      <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry: any, i: number) => {
        const isDebt = entry.dataKey === "saldoDevedor";
        return (
          <div key={i} className="flex items-center justify-between gap-4 text-xs">
            <span className="text-muted-foreground">
              {isDebt ? "Saldo Devedor" : "Abatimento"}
            </span>
            <span
              className="font-bold"
              style={{ color: isDebt ? "hsl(var(--destructive))" : "hsl(var(--chart-2))" }}
            >
              R$ {entry.value?.toLocaleString("pt-BR")}
            </span>
          </div>
        );
      })}
    </div>
  );
}
