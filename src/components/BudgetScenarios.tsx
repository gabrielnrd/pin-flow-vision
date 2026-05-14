import { useEffect, useMemo, useState } from "react";
import { useFinanceStore } from "@/stores/financeStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Trash2, GitCompare, Plus, RotateCcw, Camera, Info } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
} from "recharts";
import { useToast } from "@/hooks/use-toast";

const MONTH_MAP: Record<string, number> = {
  Janeiro: 1, Fevereiro: 2, "Março": 3, Abril: 4, Maio: 5, Junho: 6,
  Julho: 7, Agosto: 8, Setembro: 9, Outubro: 10, Novembro: 11, Dezembro: 12,
};
const MONTHS_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

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
  // Per-month overrides: { 0: { income: 5000, cost: 3200 }, 1: {...}, 2: {...} }
  const [overrides, setOverrides] = useState<Record<number, { income?: string; cost?: string }>>({});

  useEffect(() => { setScenarios(loadScenarios()); }, []);

  // Always project from current real month + next 2
  const startIdx = useMemo(() => {
    const now = new Date();
    const idx = store.cashflowMonths.findIndex(
      (m) => m.month === MONTHS_PT[now.getMonth()] && m.year === now.getFullYear()
    );
    return idx >= 0 ? idx : 0;
  }, [store.cashflowMonths]);

  const baseMonths: ScenarioMonth[] = useMemo(() => {
    const slice = store.cashflowMonths.slice(startIdx, startIdx + 3);
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
  }, [store.cashflowMonths, store.banks, startIdx]);

  // Months with overrides applied
  const editedMonths: ScenarioMonth[] = useMemo(() => {
    return baseMonths.map((m, idx) => {
      const ov = overrides[idx] || {};
      const income = ov.income !== undefined && ov.income !== "" ? parseFloat(ov.income) || 0 : m.income;
      const cost = ov.cost !== undefined && ov.cost !== "" ? parseFloat(ov.cost) || 0 : m.cost;
      return { ...m, income, cost, balance: income - cost };
    });
  }, [baseMonths, overrides]);

  const hasEdits = useMemo(
    () => Object.values(overrides).some((o) => (o.income ?? "") !== "" || (o.cost ?? "") !== ""),
    [overrides]
  );

  const updateOverride = (idx: number, field: "income" | "cost", value: string) => {
    setOverrides((prev) => ({ ...prev, [idx]: { ...prev[idx], [field]: value } }));
  };

  const resetOverrides = () => setOverrides({});

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) { toast({ title: "Dê um nome ao cenário", description: "Ex: \"Sem cartão\", \"Renda extra +1k\"", variant: "destructive" }); return; }
    const newScenario: Scenario = {
      id: crypto.randomUUID(),
      name: trimmed,
      createdAt: new Date().toISOString(),
      months: editedMonths,
    };
    const next = [...scenarios, newScenario];
    setScenarios(next); saveScenarios(next); setName(""); setOverrides({});
    toast({ title: "Cenário salvo", description: `"${trimmed}" foi adicionado à comparação.` });
  };

  const handleRemove = (id: string) => {
    const next = scenarios.filter((s) => s.id !== id);
    setScenarios(next); saveScenarios(next);
  };

  // Build chart data: one row per month, one key per scenario (+ Atual)
  const chartData = useMemo(() => {
    const labels = baseMonths.map((m) => m.label);
    return labels.map((label, idx) => {
      const row: Record<string, any> = { label };
      row["Atual"] = baseMonths[idx]?.balance ?? 0;
      if (hasEdits) row["Editando"] = editedMonths[idx]?.balance ?? 0;
      scenarios.forEach((s) => {
        row[s.name] = s.months[idx]?.balance ?? 0;
      });
      return row;
    });
  }, [baseMonths, editedMonths, scenarios, hasEdits]);

  const seriesKeys = ["Atual", ...(hasEdits ? ["Editando"] : []), ...scenarios.map((s) => s.name)];

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
              <p className="text-xs text-muted-foreground font-normal">Simule renda e custos para os próximos 3 meses</p>
            </div>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Helper banner */}
        <div className="rounded-xl bg-primary/5 border border-primary/15 p-3 flex gap-2.5 text-xs text-muted-foreground">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-foreground font-medium">Como simular um cenário:</p>
            <p>1. Edite a <strong>renda</strong> e/ou <strong>custos</strong> de cada mês abaixo (ou deixe em branco para usar o valor real).</p>
            <p>2. Dê um nome (ex: "Renda extra +1k") e clique em <strong>Salvar cenário</strong>.</p>
            <p>3. Compare no gráfico ao lado dos demais cenários salvos.</p>
          </div>
        </div>

        {/* Editable per-month grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {baseMonths.map((m, idx) => {
            const ov = overrides[idx] || {};
            const isEdited = (ov.income ?? "") !== "" || (ov.cost ?? "") !== "";
            const edited = editedMonths[idx];
            const balanceColor = edited.balance >= 0 ? "text-income" : "text-destructive";
            return (
              <div
                key={idx}
                className={`rounded-xl border p-3 space-y-2 transition ${isEdited ? "border-primary/40 bg-primary/5" : "border-border/50 bg-secondary/20"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{m.label}</span>
                  {isEdited && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-medium">editado</span>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Renda</label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder={m.income.toFixed(0)}
                    value={ov.income ?? ""}
                    onChange={(e) => updateOverride(idx, "income", e.target.value)}
                    className="h-9 text-money text-sm rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Custos</label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder={m.cost.toFixed(0)}
                    value={ov.cost ?? ""}
                    onChange={(e) => updateOverride(idx, "cost", e.target.value)}
                    className="h-9 text-money text-sm rounded-lg"
                  />
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Saldo</span>
                  <span className={`text-money text-sm font-semibold ${balanceColor}`}>
                    {edited.balance >= 0 ? "+" : ""}R$ {edited.balance.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Save controls */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder='Nome do cenário (ex: "Renda extra +1k", "Sem cartão")'
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="rounded-xl h-10 flex-1"
          />
          {hasEdits && (
            <Button variant="outline" onClick={resetOverrides} className="rounded-xl gap-2" type="button">
              <RotateCcw className="w-4 h-4" /> Resetar
            </Button>
          )}
          <Button onClick={handleSave} className="rounded-xl gap-2">
            {hasEdits ? <Save className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            {hasEdits ? "Salvar cenário" : "Salvar atual"}
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
          Barras representam o <strong>saldo (renda − custos)</strong> de cada mês.
        </p>

        {scenarios.length === 0 && !hasEdits && (
          <div className="rounded-xl border border-dashed border-border/60 p-4 flex items-center gap-3 text-sm text-muted-foreground">
            <Plus className="w-4 h-4" />
            Edite os valores acima ou salve o cenário atual para começar a comparar.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
