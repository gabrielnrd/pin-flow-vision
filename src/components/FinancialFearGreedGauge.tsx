import { useMemo } from "react";
import { useFinanceStore } from "@/stores/financeStore";

const ZONES = [
  { label: "Medo Extremo", color: "hsl(0, 72%, 51%)", min: 0, max: 20 },
  { label: "Medo", color: "hsl(27, 100%, 50%)", min: 20, max: 40 },
  { label: "Neutro", color: "hsl(45, 100%, 50%)", min: 40, max: 60 },
  { label: "Ganância", color: "hsl(145, 63%, 42%)", min: 60, max: 80 },
  { label: "Ganância Extrema", color: "hsl(160, 70%, 38%)", min: 80, max: 100 },
];

function getZone(score: number) {
  return ZONES.find((z) => score >= z.min && score < z.max) || ZONES[ZONES.length - 1];
}

export function FinancialFearGreedGauge() {
  const store = useFinanceStore();

  const { score, factors } = useMemo(() => {
    // Factor 1: Balance ratio (income vs expense) → 0-100
    const balanceRatio = store.totalIncome > 0
      ? Math.min(((store.totalIncome - store.totalExpense) / store.totalIncome) * 100, 100)
      : 0;
    const balanceScore = Math.max(0, balanceRatio);

    // Factor 2: Debt coverage (how much debt vs income) → inverted
    const debtRatio = store.totalIncome > 0
      ? Math.min(store.totalDebt / (store.totalIncome * 12), 1)
      : 1;
    const debtScore = (1 - debtRatio) * 100;

    // Factor 3: Payment consistency (% of expenses paid + card installments paid)
    const manualExpenses = store.currentCashflow.expenses;
    const manualPaid = manualExpenses.filter((e) => e.paid).length;
    const allInstallments = store.banks.flatMap((b) => b.installments);
    const installmentsPaid = allInstallments.filter((i) => i.status === "pago").length;
    const totalItems = manualExpenses.length + allInstallments.length;
    const totalPaid = manualPaid + installmentsPaid;
    const paymentScore = totalItems > 0 ? (totalPaid / totalItems) * 100 : 50;

    // Factor 4: Credit utilization (lower is better)
    const totalLimit = store.banks.reduce((s, b) => s + b.limitTotal, 0);
    const totalUsed = store.banks.reduce((s, b) => s + b.limitUsed, 0);
    const utilizationRatio = totalLimit > 0 ? totalUsed / totalLimit : 0;
    const creditScore = (1 - utilizationRatio) * 100;

    // Factor 5: Creditor progress
    const creditorProgress = store.totalCreditorsDebt > 0
      ? (store.totalCreditorsPaid / store.totalCreditorsDebt) * 100
      : 100;

    const factors = [
      { label: "Saldo Mensal", value: Math.round(balanceScore), weight: 0.25 },
      { label: "Cobertura de Dívida", value: Math.round(debtScore), weight: 0.25 },
      { label: "Contas em Dia", value: Math.round(paymentScore), weight: 0.2 },
      { label: "Uso do Crédito", value: Math.round(creditScore), weight: 0.15 },
      { label: "Progresso Credores", value: Math.round(creditorProgress), weight: 0.15 },
    ];

    const score = Math.round(
      factors.reduce((s, f) => s + f.value * f.weight, 0)
    );

    return { score, factors };
  }, [store]);

  const zone = getZone(score);
  const needleAngle = -90 + (score / 100) * 180; // -90 to 90 degrees

  return (
    <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold text-foreground tracking-tight">
          Índice Fear & Greed Financeiro
        </h3>
        <p className="text-xs text-muted-foreground">Saúde financeira baseada nos seus dados</p>
      </div>

      {/* Gauge SVG */}
      <div className="flex justify-center">
        <svg viewBox="0 0 280 170" className="w-full max-w-[320px]">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(0, 72%, 51%)" />
              <stop offset="25%" stopColor="hsl(27, 100%, 50%)" />
              <stop offset="50%" stopColor="hsl(45, 100%, 50%)" />
              <stop offset="75%" stopColor="hsl(145, 63%, 42%)" />
              <stop offset="100%" stopColor="hsl(160, 70%, 38%)" />
            </linearGradient>
          </defs>

          {/* Background arc */}
          <path
            d="M 30 150 A 110 110 0 0 1 250 150"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* Colored arc */}
          <path
            d="M 30 150 A 110 110 0 0 1 250 150"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="18"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Tick marks */}
          {[0, 20, 40, 60, 80, 100].map((tick) => {
            const angle = (-180 + (tick / 100) * 180) * (Math.PI / 180);
            const cx = 140, cy = 150, r = 125;
            const x1 = cx + (r - 5) * Math.cos(angle);
            const y1 = cy + (r - 5) * Math.sin(angle);
            const x2 = cx + (r + 5) * Math.cos(angle);
            const y2 = cy + (r + 5) * Math.sin(angle);
            return (
              <line
                key={tick}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="1.5"
                opacity="0.5"
              />
            );
          })}

          {/* Needle */}
          <g transform={`rotate(${needleAngle}, 140, 150)`} style={{ transition: "transform 1s ease-out" }}>
            <line
              x1="140" y1="150" x2="140" y2="50"
              stroke="hsl(var(--foreground))"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="140" cy="150" r="6" fill="hsl(var(--foreground))" />
            <circle cx="140" cy="150" r="3" fill="hsl(var(--background))" />
          </g>

          {/* Score */}
          <text
            x="140" y="135"
            textAnchor="middle"
            className="fill-foreground"
            fontSize="32"
            fontWeight="800"
            fontFamily="JetBrains Mono, monospace"
          >
            {score}
          </text>

          {/* Zone label */}
          <text
            x="140" y="158"
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill={zone.color}
          >
            {zone.label}
          </text>
        </svg>
      </div>

      {/* Factor breakdown */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fatores</p>
        {factors.map((f) => {
          const fZone = getZone(f.value);
          return (
            <div key={f.label} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-[140px] shrink-0">{f.label}</span>
              <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${f.value}%`, backgroundColor: fZone.color }}
                />
              </div>
              <span
                className="text-xs font-mono font-bold w-8 text-right"
                style={{ color: fZone.color }}
              >
                {f.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
