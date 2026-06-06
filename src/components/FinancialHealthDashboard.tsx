import { useMemo } from "react";
import { useFinanceStore } from "@/stores/financeStore";
import { Shield, PiggyBank, Receipt, TrendingDown } from "lucide-react";

function tone(pct: number, invert = false) {
  const v = invert ? 100 - pct : pct;
  if (v >= 70) return "hsl(145, 63%, 48%)";
  if (v >= 40) return "hsl(45, 100%, 55%)";
  return "hsl(0, 72%, 55%)";
}

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

const FIXED_KEYWORDS = /(aluguel|condom|iptu|luz|água|agua|internet|energia|gás|gas|netflix|spotify|disney|hbo|prime|youtube|icloud|assinatura|plano)/i;

export function FinancialHealthDashboard() {
  const store = useFinanceStore();

  const data = useMemo(() => {
    const income = store.totalIncome || 1;
    const savings = Math.max(0, store.expectedBalance);
    const savingsPct = Math.min(100, (savings / income) * 100);

    const dynamicDebt =
      store.banks.reduce(
        (s, b) =>
          s + b.installments.filter((i) => i.status !== "pago").reduce((x, i) => x + i.installmentAmount, 0),
        0
      ) + (store.totalCreditorsDebt - store.totalCreditorsPaid);
    const dtiPct = Math.min(100, (dynamicDebt / (income * 6)) * 100);

    const fixed =
      store.currentCashflow.expenses
        .filter((e) => FIXED_KEYWORDS.test(e.label) || e.category === "moradia" || e.category === "assinaturas" || e.category === "contas")
        .reduce((s, e) => s + e.amount, 0);
    const fixedPct = Math.min(100, (fixed / income) * 100);

    // Composite score
    const score = Math.round(savingsPct * 0.4 + (100 - dtiPct) * 0.35 + (100 - Math.max(0, fixedPct - 50) * 2) * 0.25);

    return {
      score: Math.max(0, Math.min(100, score)),
      savingsPct,
      savingsValue: savings,
      dtiPct,
      debtValue: dynamicDebt,
      fixedPct,
      fixedValue: fixed,
    };
  }, [store.totalIncome, store.expectedBalance, store.banks, store.totalCreditorsDebt, store.totalCreditorsPaid, store.currentCashflow]);

  const circumference = 2 * Math.PI * 56;
  const offset = circumference - (data.score / 100) * circumference;
  const scoreColor = tone(data.score);

  const indicators = [
    {
      label: "Poupança",
      icon: PiggyBank,
      pct: data.savingsPct,
      value: fmt(data.savingsValue),
      hint: `${data.savingsPct.toFixed(0)}% da renda`,
      invert: false,
    },
    {
      label: "Dívida",
      icon: TrendingDown,
      pct: data.dtiPct,
      value: fmt(data.debtValue),
      hint: `${data.dtiPct.toFixed(0)}% da renda anual`,
      invert: true,
    },
    {
      label: "Gastos Fixos",
      icon: Receipt,
      pct: data.fixedPct,
      value: fmt(data.fixedValue),
      hint: `${data.fixedPct.toFixed(0)}% da renda`,
      invert: true,
    },
  ];

  return (
    <div className="rounded-2xl bg-card border border-border/50 p-5">
      <div className="flex items-center gap-3 mb-5">
        <Shield className="w-5 h-5 text-primary" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">Dashboard de Saúde Financeira</h3>
          <p className="text-xs text-muted-foreground">Score composto baseado em 3 pilares</p>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-5">
        <div className="relative w-[140px] h-[140px] flex-shrink-0">
          <svg viewBox="0 0 130 130" className="w-full h-full -rotate-90">
            <circle cx="65" cy="65" r="56" fill="none" stroke="hsl(var(--secondary))" strokeWidth="9" />
            <circle
              cx="65"
              cy="65"
              r="56"
              fill="none"
              stroke={scoreColor}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-money" style={{ color: scoreColor }}>{data.score}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">de 100</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {indicators.map((ind) => {
            const Icon = ind.icon;
            const color = tone(ind.pct, ind.invert);
            return (
              <div key={ind.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                    <span className="text-xs font-medium text-foreground">{ind.label}</span>
                  </div>
                  <span className="text-[11px] text-money text-muted-foreground">{ind.value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, ind.pct)}%`, backgroundColor: color }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{ind.hint}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
