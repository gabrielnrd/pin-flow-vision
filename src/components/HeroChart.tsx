import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { type CashflowMonth, type Bank } from "@/data/financialData";
import { TrendingDown, TrendingUp, Target, Pencil, Check, X, ChevronDown, ChevronUp, CreditCard, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/use-theme";
import { type Creditor } from "@/data/financialData";

interface HeroChartProps {
  cashflowMonths: CashflowMonth[];
  totalDebt: number;
  totalExpense: number;
  expectedBalance: number;
  savingsGoalMonth: number;
  onSavingsGoalChange: (v: number) => void;
  selectedMonth: number;
  banks: Bank[];
  creditors: Creditor[];
  cardExpensesForMonth: number;
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

export function HeroChart({ cashflowMonths, totalDebt, totalExpense, expectedBalance, savingsGoalMonth, onSavingsGoalChange, selectedMonth, banks, creditors, cardExpensesForMonth }: HeroChartProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalValue, setGoalValue] = useState(String(savingsGoalMonth));
  const [showBreakdown, setShowBreakdown] = useState(false);

  const monthNameToIndex: Record<string, number> = {
    "Janeiro": 0, "Fevereiro": 1, "Março": 2, "Abril": 3,
    "Maio": 4, "Junho": 5, "Julho": 6, "Agosto": 7,
    "Setembro": 8, "Outubro": 9, "Novembro": 10, "Dezembro": 11,
  };

  // Calculate cumulative card payments from month 0 through selectedMonth
  const cumulativeCardPayments = useMemo(() => {
    let total = 0;
    for (let i = 0; i <= selectedMonth && i < cashflowMonths.length; i++) {
      const m = cashflowMonths[i];
      const mIdx = monthNameToIndex[m.month] ?? 0;
      const monthNum = mIdx + 1;
      total += banks.reduce((bankTotal, bank) => {
        return bankTotal + bank.installments
          .filter((inst) => {
            const d = new Date(inst.dueDate + "T00:00:00");
            return d.getMonth() + 1 === monthNum && d.getFullYear() === m.year;
          })
          .reduce((sum, inst) => sum + inst.installmentAmount, 0);
      }, 0);
    }
    return total;
  }, [banks, cashflowMonths, selectedMonth]);

  // Build breakdown items
  const breakdownItems = useMemo(() => {
    const items: { label: string; value: number; type: "debt" | "payment"; icon: "card" | "creditor" }[] = [];
    
    // Bank debts
    banks.forEach((b) => {
      const used = b.installments
        .filter((inst) => inst.status !== "pago")
        .reduce((sum, inst) => sum + inst.installmentAmount, 0);
      if (used > 0) {
        items.push({ label: b.name, value: used, type: "debt", icon: "card" });
      }
    });
    
    // Creditor debts
    creditors.forEach((c) => {
      const remaining = c.totalDebt - c.amountPaid;
      if (remaining > 0) {
        items.push({ label: c.name, value: remaining, type: "debt", icon: "creditor" });
      }
    });
    
    return items;
  }, [banks, creditors]);

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

  // Build chart data with solid lines for past months & dashed for future
  const chartData = useMemo(() => {
    const monthNameToIndex: Record<string, number> = {
      "Janeiro": 0, "Fevereiro": 1, "Março": 2, "Abril": 3,
      "Maio": 4, "Junho": 5, "Julho": 6, "Agosto": 7,
      "Setembro": 8, "Outubro": 9, "Novembro": 10, "Dezembro": 11,
    };
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-based
    const currentYear = now.getFullYear();

    const monthNames3 = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    const result = cashflowMonths.map((m) => {
      const mIdx = monthNameToIndex[m.month] ?? 0;
      const isPast = m.year < currentYear || (m.year === currentYear && mIdx <= currentMonth);
      const entradas = m.incomes.reduce((s, i) => s + i.amount, 0);
      const manualSaidas = m.expenses.reduce((s, e) => s + e.amount, 0);

      // Add card installments for this month
      const monthNum = mIdx + 1;
      const cardSaidas = banks.reduce((total, bank) => {
        return total + bank.installments
          .filter((inst) => {
            const d = new Date(inst.dueDate + "T00:00:00");
            return d.getMonth() + 1 === monthNum && d.getFullYear() === m.year;
          })
          .reduce((sum, inst) => sum + inst.installmentAmount, 0);
      }, 0);
      const saidas = manualSaidas + cardSaidas;

      return {
        month: `${m.month.slice(0, 3)}/${m.year}`,
        entradas: isPast ? entradas : undefined as number | undefined,
        saidas: isPast ? saidas : undefined as number | undefined,
        future_entradas: !isPast ? entradas : undefined as number | undefined,
        future_saidas: !isPast ? saidas : undefined as number | undefined,
      };
    });

    // Bridge: last past month should also appear in future series for continuity
    let lastPastIdx = -1;
    for (let i = result.length - 1; i >= 0; i--) { if (result[i].entradas !== undefined) { lastPastIdx = i; break; } }
    if (lastPastIdx >= 0 && lastPastIdx < result.length - 1) {
      result[lastPastIdx].future_entradas = result[lastPastIdx].entradas;
      result[lastPastIdx].future_saidas = result[lastPastIdx].saidas;
    }


    return result;
  }, [cashflowMonths, banks]);

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
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "hsl(240 5% 90%)" : "hsl(240 5% 18% / 0.5)"} />
                <XAxis dataKey="month" tick={{ fill: isLight ? "hsl(240 5% 40%)" : "hsl(240 5% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: isLight ? "hsl(240 5% 40%)" : "hsl(240 5% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    const labels: Record<string, string> = { entradas: "Entradas", saidas: "Saídas", future_entradas: "Entradas (Projeção)", future_saidas: "Saídas (Projeção)" };
                    return [`R$ ${value?.toLocaleString("pt-BR") ?? "—"}`, labels[name] || name];
                  }}
                  contentStyle={{
                    background: isLight ? "hsl(0 0% 100% / 0.95)" : "hsl(240 6% 10% / 0.95)",
                    border: `1px solid ${isLight ? "hsl(240 5% 87%)" : "hsl(240 5% 25% / 0.4)"}`,
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: isLight ? "hsl(240 10% 10%)" : "hsl(0 0% 95%)",
                  }}
                />
                <Line type="monotone" dataKey="entradas" stroke="hsl(145 63% 42%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(145 63% 42%)" }} activeDot={{ r: 6 }} name="entradas" connectNulls={false} />
                <Line type="monotone" dataKey="saidas" stroke="hsl(0 72% 51%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(0 72% 51%)" }} activeDot={{ r: 6 }} name="saidas" connectNulls={false} />
                {/* Future/dashed lines */}
                <Line type="monotone" dataKey="future_entradas" stroke="hsl(145 63% 42%)" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 3, fill: "hsl(145 63% 42%)", strokeDasharray: "" }} name="future_entradas" connectNulls={false} />
                <Line type="monotone" dataKey="future_saidas" stroke="hsl(0 72% 51%)" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 3, fill: "hsl(0 72% 51%)", strokeDasharray: "" }} name="future_saidas" connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-5 mt-3">
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="w-3 h-3 rounded-sm bg-income inline-block" /> Entradas</span>
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="w-3 h-3 rounded-sm bg-expense inline-block" /> Saídas</span>
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="w-3 h-0.5 border-t-2 border-dashed border-muted-foreground inline-block" /> Projeção</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 stagger-children">

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

          <div className="glass-card rounded-2xl p-4 flex-1">
            <div
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => setShowBreakdown(!showBreakdown)}
            >
              <div className="w-11 h-11 rounded-xl bg-chart-2/15 flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5 text-chart-2" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">Próximo Total</p>
                  {totalDebt > 0 && cumulativeCardPayments > 0 && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-income/10 text-[10px] font-semibold text-income">
                      <TrendingDown className="w-3 h-3" />
                      −{((cumulativeCardPayments / totalDebt) * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
                <p className="text-2xl text-money text-chart-2">
                  R$ {Math.max(totalDebt - cumulativeCardPayments, 0).toLocaleString("pt-BR")}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Até {cashflowMonths[selectedMonth]?.month.slice(0, 3)}/{cashflowMonths[selectedMonth]?.year} (−R$ {cumulativeCardPayments.toLocaleString("pt-BR")})
                </p>
              </div>
              <div className="text-muted-foreground">
                {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {showBreakdown && (
              <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5 animate-float-in">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Composição da Dívida</p>
                {breakdownItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded-md bg-secondary/80 flex items-center justify-center shrink-0">
                      {item.icon === "card" ? (
                        <CreditCard className="w-3 h-3 text-muted-foreground" />
                      ) : (
                        <Users className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                    <span className="flex-1 text-muted-foreground truncate">{item.label}</span>
                    <span className="text-expense font-medium tabular-nums">
                      R$ {item.value.toLocaleString("pt-BR")}
                    </span>
                  </div>
                ))}
                {cumulativeCardPayments > 0 && (
                  <>
                    <div className="border-t border-dashed border-border/50 my-2" />
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-5 h-5 rounded-md bg-income/10 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-income" />
                      </div>
                      <span className="flex-1 text-income">Pagamentos até {cashflowMonths[selectedMonth]?.month.slice(0, 3)}</span>
                      <span className="text-income font-medium tabular-nums">
                        −R$ {cumulativeCardPayments.toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
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
