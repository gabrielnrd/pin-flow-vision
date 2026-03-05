import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { type CashflowMonth } from "@/data/financialData";
import { TrendingDown, Wallet, Target, Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface HeroChartProps {
  cashflowMonths: CashflowMonth[];
  totalDebt: number;
  expectedBalance: number;
  savingsGoalMonth: number;
  onSavingsGoalChange: (v: number) => void;
}

export function HeroChart({ cashflowMonths, totalDebt, expectedBalance, savingsGoalMonth, onSavingsGoalChange }: HeroChartProps) {
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalValue, setGoalValue] = useState(String(savingsGoalMonth));

  const handleSaveGoal = () => {
    const val = parseFloat(goalValue);
    if (!isNaN(val) && val >= 0) onSavingsGoalChange(val);
    setEditingGoal(false);
  };

  const chartData = cashflowMonths.map((m) => ({
    month: `${m.month.slice(0, 3)}/${m.year}`,
    entradas: m.incomes.reduce((s, i) => s + i.amount, 0),
    saidas: m.expenses.reduce((s, e) => s + e.amount, 0),
  }));

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
                  formatter={(value: number, name: string) => [
                    `R$ ${value.toLocaleString("pt-BR")}`,
                    name === "entradas" ? "Entradas" : "Saídas",
                  ]}
                  contentStyle={{ background: "hsl(240 6% 10% / 0.95)", border: "1px solid hsl(240 5% 25% / 0.4)", borderRadius: "12px", fontSize: "12px", color: "hsl(0 0% 95%)" }}
                />
                <Line type="monotone" dataKey="entradas" stroke="hsl(145 63% 42%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(145 63% 42%)" }} activeDot={{ r: 6 }} name="entradas" />
                <Line type="monotone" dataKey="saidas" stroke="hsl(0 72% 51%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(0 72% 51%)" }} activeDot={{ r: 6 }} name="saidas" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-5 mt-3">
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="w-3 h-3 rounded-sm bg-income inline-block" /> Entradas</span>
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="w-3 h-3 rounded-sm bg-expense inline-block" /> Saídas</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="glass-card rounded-2xl p-4 flex items-center gap-4 flex-1">
            <div className="w-11 h-11 rounded-xl bg-income/15 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-income" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Saldo Atual</p>
              <p className={`text-2xl text-money ${expectedBalance >= 0 ? "text-income" : "text-expense"}`}>
                R$ {expectedBalance.toLocaleString("pt-BR")}
              </p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center gap-4 flex-1">
            <div className="w-11 h-11 rounded-xl bg-expense/15 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-expense" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dívida Total</p>
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
