import { useMemo } from "react";
import { type CashflowMonth } from "@/data/financialData";
import { ExportXlsxButton } from "@/components/ExportXlsxButton";

interface DashboardHeaderProps {
  totalDebt: number;
  expectedBalance: number;
  monthLabel: string;
  selectedMonth: number;
  totalMonths: number;
  onMonthChange: (month: number) => void;
  cashflowMonths: CashflowMonth[];
}

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Bom dia";
  if (h >= 12 && h < 18) return "Boa tarde";
  return "Boa noite";
}

export function DashboardHeader({
  monthLabel,
  selectedMonth,
  onMonthChange,
  cashflowMonths,
}: DashboardHeaderProps) {
  const greeting = useMemo(() => getGreeting(), []);

  return (
    <header className="mb-12 animate-float-in">
      {/* Masthead */}
      <div className="flex items-end justify-between gap-6 pb-5">
        <div className="min-w-0">
          <p className="label-mono">{greeting} — {monthLabel}</p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-[-0.04em] text-foreground mt-2">
            Gabriel
          </h1>
        </div>
        <div className="hidden sm:block text-right">
          <p className="label-mono">Visão financeira</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
            Um panorama editorial dos seus números, atualizado em tempo real.
          </p>
        </div>
      </div>

      <div className="hairline" />

      {/* Month rail */}
      <div className="flex items-center gap-3 pt-4">
        <span className="label-mono hidden sm:inline shrink-0">Período</span>
        <div className="flex gap-1 overflow-x-auto scrollbar-none flex-1 min-w-0">
          {cashflowMonths.map((m, i) => (
            <button
              key={i}
              onClick={() => onMonthChange(i)}
              className={`shrink-0 px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest border-b-2 transition-colors ${
                i === selectedMonth
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.month.slice(0, 3)}
            </button>
          ))}
        </div>
        <ExportXlsxButton compact />
      </div>
    </header>
  );
}
