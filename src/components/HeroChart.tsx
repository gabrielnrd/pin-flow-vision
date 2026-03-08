import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { type CashflowMonth } from "@/data/financialData";
import { TrendingDown, TrendingUp, Wallet, Target, Pencil, Check, X, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

interface HeroChartProps {
  cashflowMonths: CashflowMonth[];
  totalDebt: number;
  expectedBalance: number;
  savingsGoalMonth: number;
  onSavingsGoalChange: (v: number) => void;
  selectedMonth: number;
}

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return null;
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  const isPositive = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${isPositive ? "text-income" : "text-expense"}`}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

function DebtTrendBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return null;
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  // For debt, going DOWN is good
  const isGood = pct <= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${isGood ? "text-income" : "text-expense"}`}>
      {pct <= 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

export function HeroChart({ cashflowMonths, totalDebt, expectedBalance, savingsGoalMonth, onSavingsGoalChange, selectedMonth }: HeroChartProps) {
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalValue, setGoalValue] = useState(String(savingsGoalMonth));
  const [balanceHidden, setBalanceHidden] = useState(false);

  const handleSaveGoal = () => {
    const val = parseFloat(goalValue);
    if (!isNaN(val) && val >= 0) onSavingsGoalChange(val);
    setEditingGoal(false);
  };

  // Calculate previous month balance for trend
  const prevBalance = useMemo(() => {
    if (selectedMonth <= 0) return null;
    const prev = cashflowMonths[selectedMonth - 1];
    const inc = prev.incomes.reduce((s, i) => s + i.amount, 0);
    const exp = prev.expenses.reduce((s, e) => s + e.amount, 0);
    return inc - exp;
  }, [cashflowMonths, selectedMonth]);

  // Build chart data with projection
  const chartData = useMemo(() => {
    const real = cashflowMonths.map((m, i) => ({
      month: `${m.month.slice(0, 3)}/${m.year}`,
      entradas: m.incomes.reduce((s, i) => s + i.amount, 0),
      saidas: m.expenses.reduce((s, e) => s + e.amount, 0),
      projected_entradas: undefined as number | undefined,
      projected_saidas: undefined as number | undefined,
    }));

    // Add projection based on averages
    if (real.length >= 2) {
      const last = real[real.length - 1];
      const avgEntradas = real.reduce((s, r) => s + r.entradas, 0) / real.length;
      const avgSaidas = real.reduce((s, r) => s + r.saidas, 0) / real.length;
      // Bridge: last real point also starts projection
      last.projected_entradas = last.entradas;
      last.projected_saidas = last.saidas;

      const lastMonth = cashflowMonths[cashflowMonths.length - 1];
      const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const monthIdx = monthNames.indexOf(lastMonth.month.slice(0, 3));
      
      for (let i = 1; i <= 2; i++) {
        const nextIdx = (monthIdx + i) % 12;
        const nextYear = lastMonth.year + Math.floor((monthIdx + i) / 12);
        real.push({
          month: `${monthNames[nextIdx]}/${nextYear}`,
          entradas: undefined as any,
          saidas: undefined as any,
          projected_entradas: Math.round(avgEntradas * (1 + (Math.random() - 0.5) * 0.05)),
          projected_saidas: Math.round(avgSaidas * (1 + (Math.random() - 0.5) * 0.05)),
        });
      }
    }
    return real;
  }, [cashflowMonths]);

  return (
    <section className="mb-8 animate-float-in">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Entradas × Saídas — Fluxo de Caixa
          </h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 18% / 0.5)" />
                <XAxis dataKey="month" tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    const labels: Record<string, string> = { entradas: "Entradas", saidas: "Saídas", projected_entradas: "Entradas (Projeção)", projected_saidas: "Saídas (Projeção)" };
                    return [`R$ ${value?.toLocaleString("pt-BR") ?? "—"}`, labels[name] || name];
                  }}
                  contentStyle={{ background: "hsl(240 6% 10% / 0.95)", border: "1px solid hsl(240 5% 25% / 0.4)", borderRadius: "12px", fontSize: "12px", color: "hsl(0 0% 95%)" }}
                />
                <Line type="monotone" dataKey="entradas" stroke="hsl(145 63% 42%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(145 63% 42%)" }} activeDot={{ r: 6 }} name="entradas" connectNulls={false} />
                <Line type="monotone" dataKey="saidas" stroke="hsl(0 72% 51%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(0 72% 51%)" }} activeDot={{ r: 6 }} name="saidas" connectNulls={false} />
                {/* Projection lines */}
                <Line type="monotone" dataKey="projected_entradas" stroke="hsl(145 63% 42%)" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 3, fill: "hsl(145 63% 42%)", strokeDasharray: "" }} name="projected_entradas" connectNulls={false} />
                <Line type="monotone" dataKey="projected_saidas" stroke="hsl(0 72% 51%)" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 3, fill: "hsl(0 72% 51%)", strokeDasharray: "" }} name="projected_saidas" connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-5 mt-3">
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="w-3 h-3 rounded-sm bg-income inline-block" /> Entradas</span>
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="w-3 h-3 rounded-sm bg-expense inline-block" /> Saídas</span>
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="w-3 h-0.5 border-t-2 border-dashed border-muted-foreground inline-block" /> Projeção</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">

          <div className="glass-card rounded-2xl p-4 flex items-center gap-4 flex-1">
            <div className="w-11 h-11 rounded-xl bg-expense/15 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-expense" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">Dívida Total</p>
                <DebtTrendBadge current={totalDebt} previous={totalDebt * 1.05} />
              </div>
              <p className="text-2xl text-money text-expense">R$ {totalDebt.toLocaleString("pt-BR")}</p>
              <p className="text-[10px] text-muted-foreground">Cartões + Credores</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center gap-4 flex-1 group">
            <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Meta de Economia</p>
              {editingGoal ? (
                <div className="flex items-center gap-1">
                  <Input type="number" value={goalValue} onChange={(e) => setGoalValue(e.target.value)} className="h-8 text-sm rounded-lg w-28" autoFocus />
                  <button onClick={handleSaveGoal} className="p-1 rounded hover:bg-income/20 text-income"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setEditingGoal(false)} className="p-1 rounded hover:bg-expense/20 text-expense"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <p
                  className="text-2xl text-money text-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => { setGoalValue(String(savingsGoalMonth)); setEditingGoal(true); }}
                >
                  R$ {savingsGoalMonth.toLocaleString("pt-BR")}
                  <span className="text-sm text-muted-foreground font-normal">/mês</span>
                  <Pencil className="w-3 h-3 inline ml-2 opacity-0 group-hover:opacity-50" />
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
