import { useState, useMemo } from "react";
import { DebtTrackingChart } from "@/components/DebtTrackingChart";
import { FinancialFearGreedGauge } from "@/components/FinancialFearGreedGauge";
import { CreditorWidget } from "@/components/CreditorWidget";
import { useFinanceStore } from "@/stores/financeStore";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingDown, TrendingUp, Percent, CalendarDays, AlertTriangle,
  Clock, CheckCircle2, Calculator, Zap, Target, History, Bell, Flame, Snowflake, Timer, Briefcase, Wallet,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ExportXlsxButton } from "@/components/ExportXlsxButton";

/* ───── Helpers ───── */

function getDueDateStatus(dueDate?: string): "overdue" | "soon" | "ok" {
  if (!dueDate) return "ok";
  const now = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "overdue";
  if (diffDays <= 7) return "soon";
  return "ok";
}

const STATUS_CONFIG = {
  overdue: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", icon: AlertTriangle, label: "Atrasado" },
  soon: { color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30", icon: Clock, label: "Vence em breve" },
  ok: { color: "text-chart-2", bg: "bg-chart-2/10", border: "border-chart-2/30", icon: CheckCircle2, label: "Em dia" },
};

/* ───── Stat Card ───── */

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold text-foreground text-money">{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

/* ───── Donut Chart ───── */

function DebtDonutChart({ data }: { data: { name: string; value: number; paid: number }[] }) {
  const chartData = data.filter(d => d.value > 0).map(d => ({
    name: d.name,
    remaining: d.value - d.paid,
    paid: d.paid,
    pct: d.value > 0 ? Math.round((d.paid / d.value) * 100) : 100,
  }));

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--chart-2))",
    "hsl(45, 100%, 50%)",
    "hsl(var(--destructive))",
    "hsl(280, 60%, 55%)",
    "hsl(200, 70%, 50%)",
  ];

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">% Quitado por Dívida</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="remaining"
                nameKey="name"
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={80}
                stroke="hsl(var(--background))"
                strokeWidth={2}
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.4} />
                ))}
              </Pie>
              <Pie
                data={chartData}
                dataKey="paid"
                nameKey="name"
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={80}
                stroke="none"
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-popover/95 backdrop-blur-md border border-border rounded-xl px-3 py-2 shadow-xl text-xs">
                      <p className="font-semibold text-foreground">{d.name}</p>
                      <p className="text-muted-foreground">{d.pct}% quitado</p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1.5 mt-2">
          {chartData.map((d, i) => (
            <div key={d.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-muted-foreground">{d.name}</span>
              </div>
              <span className="font-semibold text-foreground">{d.pct}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ───── Debt Cards (per creditor) ───── */

function DebtCard({ creditor }: { creditor: ReturnType<typeof useFinanceStore>["creditors"][0] }) {
  const remaining = creditor.totalDebt - creditor.amountPaid;
  const pct = creditor.totalDebt > 0 ? (creditor.amountPaid / creditor.totalDebt) * 100 : 100;
  const status = getDueDateStatus(creditor.dueDate);
  const cfg = STATUS_CONFIG[status];
  const StatusIcon = cfg.icon;
  const isComplete = pct >= 100;

  return (
    <div className={`rounded-xl border ${isComplete ? "border-chart-2/30" : cfg.border} bg-card/80 backdrop-blur-sm p-4 space-y-3`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">{creditor.name}</p>
          <p className="text-xs text-muted-foreground">
            Saldo: <span className="text-money font-semibold text-foreground">R$ {remaining.toLocaleString("pt-BR")}</span>
          </p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${isComplete ? "bg-chart-2/10 text-chart-2" : `${cfg.bg} ${cfg.color}`}`}>
          <StatusIcon className="w-3 h-3" />
          {isComplete ? "Quitado" : cfg.label}
        </div>
      </div>

      <div className="flex gap-4 text-xs text-muted-foreground">
        {creditor.interestRate != null && creditor.interestRate > 0 && (
          <span>Juros: <span className="text-foreground font-medium">{creditor.interestRate}% a.m.</span></span>
        )}
        {creditor.dueDate && (
          <span>Vencimento: <span className="text-foreground font-medium">{new Date(creditor.dueDate).toLocaleDateString("pt-BR")}</span></span>
        )}
      </div>

      <div>
        <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
          <span>{pct.toFixed(0)}% quitado</span>
          <span className="text-money">R$ {creditor.amountPaid.toLocaleString("pt-BR")} / {creditor.totalDebt.toLocaleString("pt-BR")}</span>
        </div>
        <Progress
          value={Math.min(pct, 100)}
          className={`h-2 bg-secondary ${isComplete ? "[&>div]:bg-chart-2" : status === "overdue" ? "[&>div]:bg-destructive" : status === "soon" ? "[&>div]:bg-yellow-500" : "[&>div]:bg-primary"}`}
        />
      </div>
    </div>
  );
}

/* ───── Payoff Simulator ───── */

function PayoffSimulator({ creditors }: { creditors: ReturnType<typeof useFinanceStore>["creditors"] }) {
  const [monthlyPayment, setMonthlyPayment] = useState(500);
  const [strategy, setStrategy] = useState<"avalanche" | "snowball">("avalanche");

  const active = creditors.filter(c => c.amountPaid < c.totalDebt);

  const projections = useMemo(() => {
    if (active.length === 0 || monthlyPayment <= 0) return { items: [], totalMonths: 0, totalInterest: 0 };

    const sorted = strategy === "avalanche"
      ? [...active].sort((a, b) => (b.interestRate ?? 0) - (a.interestRate ?? 0))
      : [...active].sort((a, b) => (a.totalDebt - a.amountPaid) - (b.totalDebt - b.amountPaid));

    let totalMonths = 0;
    let totalInterest = 0;

    const items = sorted.map(c => {
      const remaining = c.totalDebt - c.amountPaid;
      const rate = (c.interestRate ?? 0) / 100;

      if (rate > 0 && monthlyPayment > remaining * rate) {
        // With interest
        const months = Math.ceil(Math.log(monthlyPayment / (monthlyPayment - remaining * rate)) / Math.log(1 + rate));
        const totalPaid = monthlyPayment * months;
        const interest = totalPaid - remaining;
        totalInterest += Math.max(interest, 0);
        totalMonths = Math.max(totalMonths, months);
        return { name: c.name, remaining, months, interest: Math.max(interest, 0), rate: c.interestRate ?? 0 };
      } else {
        const months = Math.ceil(remaining / monthlyPayment);
        totalMonths = Math.max(totalMonths, months);
        return { name: c.name, remaining, months, interest: 0, rate: c.interestRate ?? 0 };
      }
    });

    return { items, totalMonths, totalInterest };
  }, [active, monthlyPayment, strategy]);

  const totalRemaining = active.reduce((s, c) => s + (c.totalDebt - c.amountPaid), 0);

  if (active.length === 0) return null;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Simulador de Quitação</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Strategy toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setStrategy("avalanche")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              strategy === "avalanche" ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Avalanche
          </button>
          <button
            onClick={() => setStrategy("snowball")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              strategy === "snowball" ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Snowflake className="w-3.5 h-3.5" /> Bola de Neve
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground">
          {strategy === "avalanche"
            ? "💡 Pague primeiro a dívida com maior taxa de juros — economiza mais a longo prazo."
            : "💡 Pague primeiro a menor dívida — ganhe momentum psicológico rápido."}
        </p>

        {/* Monthly payment input */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/40">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Aporte/mês:</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">R$</span>
            <Input
              type="number"
              value={monthlyPayment}
              onChange={(e) => setMonthlyPayment(Math.max(0, Number(e.target.value)))}
              className="h-7 text-xs rounded-lg w-24"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-2">
          {projections.items.map(p => (
            <div key={p.name} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30">
              <div>
                <p className="text-sm text-foreground">{p.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  Restam R$ {p.remaining.toLocaleString("pt-BR")} · {p.rate > 0 ? `${p.rate}% a.m.` : "Sem juros"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-chart-2">{p.months} {p.months === 1 ? "mês" : "meses"}</p>
                {p.interest > 0 && (
                  <p className="text-[10px] text-destructive">+R$ {p.interest.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} juros</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Monthly goal message */}
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Meta Mensal</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Pagando <span className="text-primary font-bold text-money">R$ {monthlyPayment.toLocaleString("pt-BR")}</span>/mês,
            você quita todas as dívidas em <span className="text-foreground font-bold">{projections.totalMonths} {projections.totalMonths === 1 ? "mês" : "meses"}</span>
            {projections.totalInterest > 0 && (
              <>, pagando <span className="text-destructive font-bold text-money">R$ {projections.totalInterest.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span> em juros</>
            )}.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ───── Payment History Timeline ───── */

function PaymentHistory({ cashflowMonths }: { cashflowMonths: ReturnType<typeof useFinanceStore>["cashflowMonths"] }) {
  const paidEntries = useMemo(() => {
    const entries: { month: string; year: number; label: string; amount: number }[] = [];
    cashflowMonths.forEach(m => {
      m.expenses.filter(e => e.paid).forEach(e => {
        entries.push({ month: m.month, year: m.year, label: e.label, amount: e.amount });
      });
    });
    return entries.slice(-12); // Last 12
  }, [cashflowMonths]);

  if (paidEntries.length === 0) return null;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Histórico de Pagamentos</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {paidEntries.map((e, i) => (
            <div key={i} className="flex gap-3 pb-3 last:pb-0">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-chart-2 mt-1.5" />
                {i < paidEntries.length - 1 && <div className="w-px flex-1 bg-border/50" />}
              </div>
              <div className="flex-1 flex items-center justify-between pb-2">
                <div>
                  <p className="text-sm text-foreground">{e.label}</p>
                  <p className="text-[11px] text-muted-foreground">{e.month} {e.year}</p>
                </div>
                <span className="text-sm font-semibold text-chart-2 text-money">
                  R$ {e.amount.toLocaleString("pt-BR")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ───── Due Date Alerts ───── */

function DueDateAlerts({ creditors }: { creditors: ReturnType<typeof useFinanceStore>["creditors"] }) {
  const alerts = creditors
    .filter(c => c.amountPaid < c.totalDebt && c.dueDate)
    .map(c => {
      const status = getDueDateStatus(c.dueDate);
      const due = new Date(c.dueDate!);
      const diffDays = Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return { ...c, status, diffDays };
    })
    .filter(c => c.status !== "ok")
    .sort((a, b) => a.diffDays - b.diffDays);

  if (alerts.length === 0) return null;

  return (
    <Card className="border-destructive/20 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-destructive" />
          <CardTitle className="text-sm font-medium text-destructive uppercase tracking-wider">Alertas de Vencimento</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.map(a => {
          const cfg = STATUS_CONFIG[a.status];
          return (
            <div key={a.id} className={`flex items-center justify-between p-3 rounded-lg ${cfg.bg}`}>
              <div className="flex items-center gap-2">
                <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                <div>
                  <p className="text-sm text-foreground">{a.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    R$ {(a.totalDebt - a.amountPaid).toLocaleString("pt-BR")} restantes
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xs font-semibold ${cfg.color}`}>
                  {a.diffDays < 0 ? `${Math.abs(a.diffDays)} dias atrasado` : `${a.diffDays} dias`}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(a.dueDate!).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/* ───── Payoff Time (48h/semana) ───── */

function PayoffTimeCard({
  totalRemaining,
  cashflowMonths,
}: {
  totalRemaining: number;
  cashflowMonths: ReturnType<typeof useFinanceStore>["cashflowMonths"];
}) {
  const HOURS_PER_WEEK = 48;
  const HOURS_PER_MONTH = HOURS_PER_WEEK * (52 / 12); // ≈ 208

  const { avgIncome, hourlyRate, workHours, calendarDays, workDays, weeks } = useMemo(() => {
    const totals = cashflowMonths.map((m) => m.incomes.reduce((s, i) => s + i.amount, 0));
    const positive = totals.filter((t) => t > 0);
    const avg = positive.length > 0 ? positive.reduce((s, t) => s + t, 0) / positive.length : 0;
    const rate = avg / HOURS_PER_MONTH;
    const hours = rate > 0 ? totalRemaining / rate : 0;
    const wks = hours / HOURS_PER_WEEK;
    const cal = wks * 7;
    const wDays = hours / 8; // 8h/dia útil
    return { avgIncome: avg, hourlyRate: rate, workHours: hours, calendarDays: cal, workDays: wDays, weeks: wks };
  }, [cashflowMonths, totalRemaining]);

  const totalHoursCeil = Math.ceil(workHours);
  const days = Math.floor(calendarDays);
  const hoursRemainder = Math.max(0, Math.ceil((calendarDays - days) * 24));

  if (totalRemaining <= 0) {
    return (
      <Card className="border-chart-2/30 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-5 text-center">
          <p className="text-sm text-chart-2 font-semibold">🎉 Sem dívida pendente — nada a quitar!</p>
        </CardContent>
      </Card>
    );
  }

  if (avgIncome <= 0) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground">Cadastre suas receitas para calcular o tempo de trabalho até a quitação.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-card/90 to-primary/5 backdrop-blur-sm overflow-hidden relative">
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
      <CardHeader className="pb-3 relative">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Timer className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold tracking-tight">Tempo até a Quitação</CardTitle>
            <p className="text-xs text-muted-foreground">Baseado em escala de 48h/semana e sua renda média mensal</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-secondary/40">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Dias corridos</p>
            <p className="text-2xl font-bold text-primary text-money">{days}</p>
            <p className="text-[11px] text-muted-foreground">e {hoursRemainder}h</p>
          </div>
          <div className="p-3 rounded-xl bg-secondary/40">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Horas de trabalho</p>
            <p className="text-2xl font-bold text-foreground text-money">{totalHoursCeil.toLocaleString("pt-BR")}h</p>
            <p className="text-[11px] text-muted-foreground">a 48h/semana</p>
          </div>
          <div className="p-3 rounded-xl bg-secondary/40">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Semanas</p>
            <p className="text-2xl font-bold text-foreground text-money">{Math.ceil(weeks)}</p>
            <p className="text-[11px] text-muted-foreground">≈ {Math.ceil(workDays)} dias úteis (8h)</p>
          </div>
          <div className="p-3 rounded-xl bg-secondary/40">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Valor/hora</p>
            <p className="text-2xl font-bold text-chart-2 text-money">R$ {hourlyRate.toFixed(2)}</p>
            <p className="text-[11px] text-muted-foreground">Renda média: R$ {Math.round(avgIncome).toLocaleString("pt-BR")}</p>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <Briefcase className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Para quitar <span className="text-foreground font-semibold text-money">R$ {totalRemaining.toLocaleString("pt-BR")}</span>,
            você precisa trabalhar <span className="text-primary font-bold">{totalHoursCeil.toLocaleString("pt-BR")} horas</span>
            {" "}(≈ <span className="text-foreground font-semibold">{days} dias e {hoursRemainder} horas</span> corridos),
            considerando 48h semanais e sua renda média histórica.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ───── Page ───── */


export default function DividaPage() {
  const store = useFinanceStore();

  // Fixed initial debt baseline (user-defined). Current totalDebt is trusted;
  // amortization is derived so that remaining === store.totalDebt.
  const INITIAL_DEBT_FIXED = 30000;
  const initialTotalDebt = INITIAL_DEBT_FIXED;

  // Real debt paid so far: paid installments + creditor amortization (used for pace metrics only)
  const paidInstallmentsTotal = useMemo(
    () => store.banks.reduce(
      (s, b) => s + b.installments.filter(i => i.status === "pago").reduce((x, i) => x + i.installmentAmount, 0),
      0,
    ),
    [store.banks],
  );
  const totalRemaining = store.totalDebt;
  const totalAbatido = Math.max(initialTotalDebt - totalRemaining, 0);
  const pctQuitado = initialTotalDebt > 0 ? Math.round((totalAbatido / initialTotalDebt) * 100) : 0;

  // Average monthly abatement based on months with actual paid installments
  const monthsWithPayments = useMemo(() => {
    const set = new Set<string>();
    store.banks.forEach(b => b.installments.forEach(i => {
      if (i.status === "pago") set.add(i.dueDate.slice(0, 7));
    }));
    return set.size;
  }, [store.banks]);
  const avgMonthly = monthsWithPayments > 0 ? paidInstallmentsTotal / monthsWithPayments : 0;
  const monthsToPayOff = avgMonthly > 0 ? Math.ceil(totalRemaining / avgMonthly) : 0;

  // Extra rich metrics
  const totalInstallmentsCount = store.banks.reduce((s, b) => s + b.installments.length, 0);
  const paidInstallmentsCount = store.banks.reduce(
    (s, b) => s + b.installments.filter(i => i.status === "pago").length,
    0,
  );
  const overdueCount = store.banks.reduce(
    (s, b) => s + b.installments.filter(i => i.status === "atrasado").length,
    0,
  );
  const avgInterest = useMemo(() => {
    const rates = store.creditors.filter(c => (c.interestRate ?? 0) > 0).map(c => c.interestRate!);
    return rates.length > 0 ? rates.reduce((s, r) => s + r, 0) / rates.length : 0;
  }, [store.creditors]);
  const nextInstallment: any = useMemo(() => {
    const now = Date.now();
    return store.allInstallments
      .filter((i: any) => new Date(i.dueDate + "T00:00:00").getTime() >= now)
      .sort((a: any, b: any) => a.dueDate.localeCompare(b.dueDate))[0];
  }, [store.allInstallments]);
  const highestDebt = useMemo(() => {
    const sorted = [...store.banks].filter(b => b.status !== "cancelado").sort((a, b) => b.limitUsed - a.limitUsed);
    return sorted[0];
  }, [store.banks]);

  // Donut data: combine banks + creditors
  const donutData = useMemo(() => {
    const bankItems = store.banks.map(b => {
      const totalOwed = b.installments.reduce((s, inst) => s + inst.installmentAmount * inst.totalInstallments, 0);
      const paid = b.installments
        .filter(inst => inst.status === "pago")
        .reduce((s, inst) => s + inst.installmentAmount, 0);
      return { name: b.name, value: totalOwed, paid };
    });
    const creditorItems = store.creditors.map(c => ({
      name: c.name, value: c.totalDebt, paid: c.amountPaid,
    }));
    return [...bankItems, ...creditorItems].filter(d => d.value > 0);
  }, [store.banks, store.creditors]);

  // Sort creditors by urgency (highest interest first)
  const sortedCreditors = useMemo(() => {
    return [...store.creditors].sort((a, b) => (b.interestRate ?? 0) - (a.interestRate ?? 0));
  }, [store.creditors]);

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8 max-w-[1600px] mx-auto space-y-8 pb-24 md:pb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dívida</h1>
          <p className="text-sm text-muted-foreground">Acompanhe a evolução e abatimento da sua dívida total</p>
        </div>
        <ExportXlsxButton />
      </div>

      {/* Payoff Time (48h/semana) */}
      <PayoffTimeCard totalRemaining={totalRemaining} cashflowMonths={store.cashflowMonths} />


      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingDown}
          label="Dívida Atual"
          value={`R$ ${store.totalDebt.toLocaleString("pt-BR")}`}
          sub={`Original: R$ ${initialTotalDebt.toLocaleString("pt-BR")}`}
          color="bg-destructive/10 text-destructive"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Abatido"
          value={`R$ ${totalAbatido.toLocaleString("pt-BR")}`}
          sub={`${paidInstallmentsCount}/${totalInstallmentsCount} parcelas pagas`}
          color="bg-chart-2/10 text-chart-2"
        />
        <StatCard
          icon={Percent}
          label="Quanto Falta"
          value={`R$ ${totalRemaining.toLocaleString("pt-BR")}`}
          sub={`${pctQuitado}% quitado`}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          icon={CalendarDays}
          label="Previsão"
          value={monthsToPayOff > 0 ? `${monthsToPayOff} meses` : "—"}
          sub={avgMonthly > 0 ? `Ritmo: R$ ${Math.round(avgMonthly).toLocaleString("pt-BR")}/mês` : "sem histórico ainda"}
          color="bg-accent/50 text-accent-foreground"
        />
      </div>

      {/* Extra info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={AlertTriangle}
          label="Parcelas Atrasadas"
          value={`${overdueCount}`}
          sub={overdueCount > 0 ? "Atenção urgente" : "Tudo em dia"}
          color={overdueCount > 0 ? "bg-destructive/10 text-destructive" : "bg-chart-2/10 text-chart-2"}
        />
        <StatCard
          icon={Percent}
          label="Juros Médio (credores)"
          value={avgInterest > 0 ? `${avgInterest.toFixed(2)}% a.m.` : "—"}
          sub={`${store.creditors.length} credores`}
          color="bg-yellow-500/10 text-yellow-500"
        />
        <StatCard
          icon={Clock}
          label="Próximo Vencimento"
          value={nextInstallment ? `R$ ${nextInstallment.installmentAmount.toLocaleString("pt-BR")}` : "—"}
          sub={nextInstallment ? `${nextInstallment.bankName} · ${new Date(nextInstallment.dueDate).toLocaleDateString("pt-BR")}` : "sem parcelas"}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          icon={Flame}
          label="Maior Dívida"
          value={highestDebt ? `R$ ${highestDebt.limitUsed.toLocaleString("pt-BR")}` : "—"}
          sub={highestDebt?.name ?? ""}
          color="bg-destructive/10 text-destructive"
        />
      </div>

      {/* Due Date Alerts */}
      <DueDateAlerts creditors={store.creditors} />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        <DebtTrackingChart />
        <DebtDonutChart data={donutData} />
      </div>

      {/* Debt cards per creditor - sorted by urgency */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Zap className="w-4.5 h-4.5 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">Dívidas por Urgência</h2>
            <p className="text-xs text-muted-foreground">Ordenado por maior taxa de juros</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedCreditors.map(c => (
            <DebtCard key={c.id} creditor={c} />
          ))}
        </div>
      </section>

      {/* Simulator + History + Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <PayoffSimulator creditors={store.creditors} />
        <div className="space-y-5">
          <FinancialFearGreedGauge />
          <PaymentHistory cashflowMonths={store.cashflowMonths} />
        </div>
      </div>

      {/* Creditors CRUD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CreditorWidget
          creditors={store.creditors}
          totalDebt={store.totalCreditorsDebt}
          totalPaid={store.totalCreditorsPaid}
          onAdd={store.addCreditor}
          onRemove={store.removeCreditor}
          onUpdate={store.updateCreditor}
        />
      </div>
    </div>
  );
}
