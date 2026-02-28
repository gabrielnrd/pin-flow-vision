import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { type MonthlySnapshot } from "@/data/financialData";
import { TrendingDown, Wallet, Target } from "lucide-react";

interface HeroChartProps {
  snapshots: MonthlySnapshot[];
  totalDebt: number;
  expectedBalance: number;
  savingsGoalMonth: number;
}

export function HeroChart({ snapshots, totalDebt, expectedBalance, savingsGoalMonth }: HeroChartProps) {
  return (
    <section className="mb-8 animate-float-in">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Line Chart */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Evolução Financeira — 2026
          </h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={snapshots} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 18% / 0.5)" />
                <XAxis dataKey="month" tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `R$ ${value.toLocaleString("pt-BR")}`,
                    name === "debt" ? "Dívida" : name === "savings" ? "Poupança" : "Saldo",
                  ]}
                  contentStyle={{
                    background: "hsl(240 6% 10% / 0.95)",
                    border: "1px solid hsl(240 5% 25% / 0.4)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "hsl(0 0% 95%)",
                  }}
                />
                <Line type="monotone" dataKey="debt" stroke="hsl(0 72% 51%)" strokeWidth={2.5} dot={false} name="debt" />
                <Line type="monotone" dataKey="savings" stroke="hsl(145 63% 42%)" strokeWidth={2.5} dot={false} name="savings" />
                <Line type="monotone" dataKey="balance" stroke="hsl(265 80% 50%)" strokeWidth={1.5} dot={false} strokeDasharray="5 5" name="balance" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-5 mt-3">
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="w-3 h-0.5 rounded bg-expense inline-block" /> Dívida
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="w-3 h-0.5 rounded bg-income inline-block" /> Poupança
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="w-3 h-[1px] rounded bg-primary inline-block border-dashed" /> Saldo
            </span>
          </div>
        </div>

        {/* KPI cards */}
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
              <p className="text-xs text-muted-foreground">Total de Dívidas</p>
              <p className="text-2xl text-money text-expense">
                R$ {totalDebt.toLocaleString("pt-BR")}
              </p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center gap-4 flex-1">
            <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Meta de Economia</p>
              <p className="text-2xl text-money text-foreground">
                R$ {savingsGoalMonth.toLocaleString("pt-BR")}
                <span className="text-sm text-muted-foreground font-normal">/mês</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
