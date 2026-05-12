import { useEffect, useMemo, useState } from "react";
import { useFinanceStore } from "@/stores/financeStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Trash2, GitCompare, Plus } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
} from "recharts";
import { useToast } from "@/hooks/use-toast";

const MONTH_MAP: Record<string, number> = {
  Janeiro: 1, Fevereiro: 2, "Março": 3, Abril: 4, Maio: 5, Junho: 6,
  Julho: 7, Agosto: 8, Setembro: 9, Outubro: 10, Novembro: 11, Dezembro: 12,
};

type ScenarioMonth = { label: string; income: number; cost: number; balance: number };
type Scenario = { id: string; name: string; createdAt: string; months: ScenarioMonth[] };

const STORAGE_KEY = "fin_budget_scenarios";
const PALETTE = ["hsl(var(--primary))", "hsl(280 80% 60%)", "hsl(160 70% 45%)", "hsl(38 92% 55%)", "hsl(0 75% 60%)", "hsl(200 80% 55%)"];

function loadScenarios(): Scenario[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveScenarios(s: Scenario[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function BudgetScenarios() {
  const store = useFinanceStore();
  const { toast } = useToast();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [name, setName] = useState("");

  useEffect(() => { setScenarios(loadScenarios()); }, []);

  const currentMonths: ScenarioMonth[] = useMemo(() => {
    const slice = store.cashflowMonths.slice(store.selectedMonth, store.selectedMonth + 3);
    return slice.map((m) => {
      const monthNum = MONTH_MAP[m.month];
      const income = m.incomes.reduce((s, i) => s + i.amount, 0);
      const manual = m.expenses.reduce((s, e) => s + e.amount, 0);
      const cards = store.banks.reduce((tot, bank) => tot + bank.installments
        .filter((inst) => {
          const d = new Date(inst.dueDate + "T00:00:00");
          return d.getMonth() + 1 === monthNum && d.getFullYear() === m.year;
        })
        .reduce((sum, inst) => sum + inst.installmentAmount, 0), 0);
      const cost = manual + cards;
      return { label: `${m.month.slice(0, 3)}/${String(m.year).slice(2)}`, income, cost, balance: income - cost };
    });
  }, [store.cashflowMonths, store.selectedMonth, store.banks]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) { toast({ title: "Dê um nome ao cenário", variant: "destructive" }); return; }
    const newScenario: Scenario = {
      id: crypto.randomUUID(),
      name: trimmed,
      createdAt: new Date().toISOString(),
      months: currentMonths,
    };
    const next = [...scenarios, newScenario];
    setScenarios(next); saveScenarios(next); setName("");
    toast({ title: "Cenário salvo", description: `"${trimmed}" foi adicionado à comparação.` });
  };

  const handleRemove = (id: string) => {
    const next = scenarios.filter((s) => s.id !== id);
    setScenarios(next); saveScenarios(next);
  };

  // Build chart data: one row per month, one key per scenario (+ Atual)
  const chartData = useMemo(() => {
    const labels = currentMonths.map((m) => m.label);
    return labels.map((label, idx) => {
      const row: Record<string, any> = { label };
      row["Atual"] = currentMonths[idx]?.balance ?? 0;
      scenarios.forEach((s) => {
        row[s.name] = s.months[idx]?.balance ?? 0;
      });
      return row;
    });
  }, [currentMonths, scenarios]);

  const seriesKeys = ["Atual", ...scenarios.map((s) => s.name)];

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <GitCompare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div>Cenários de Orçamento</div>
              <p className="text-xs text-muted-foreground font-normal">Salve e compare a cobertura de renda</p>
            </div>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Save current as scenario */}
        <div className="flex gap-2">
          <Input
            placeholder='Ex: "Sem cartão", "Renda extra +1k", "Corte de gastos"'
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="rounded-xl h-10"
          />
          <Button onClick={handleSave} className="rounded-xl gap-2">
            <Save className="w-4 h-4" /> Salvar atual
          </Button>
        </div>

        {/* Saved scenarios chips */}
        {scenarios.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {scenarios.map((s, i) => (
              <div
                key={s.id}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border"
                style={{ borderColor: `${PALETTE[(i + 1) % PALETTE.length]}55`, background: `${PALETTE[(i + 1) % PALETTE.length]}12` }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: PALETTE[(i + 1) % PALETTE.length] }} />
                <span className="font-medium text-foreground">{s.name}</span>
                <button
                  onClick={() => handleRemove(s.id)}
                  className="opacity-50 hover:opacity-100 hover:text-destructive transition"
                  aria-label={`Remover ${s.name}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Comparison chart */}
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {seriesKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={PALETTE[i % PALETTE.length]} radius={[6, 6, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[11px] text-muted-foreground text-center">
          Barras representam o <strong>saldo (renda − custos)</strong> de cada mês. Edite seu fluxo e salve um novo cenário para comparar.
        </p>

        {scenarios.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/60 p-4 flex items-center gap-3 text-sm text-muted-foreground">
            <Plus className="w-4 h-4" />
            Salve seu primeiro cenário para começar a comparar alternativas de orçamento.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
