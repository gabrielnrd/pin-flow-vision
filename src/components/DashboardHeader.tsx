import { Filter } from "lucide-react";
import { type CashflowMonth } from "@/data/financialData";

interface DashboardHeaderProps {
  totalDebt: number;
  expectedBalance: number;
  monthLabel: string;
  selectedMonth: number;
  totalMonths: number;
  onMonthChange: (month: number) => void;
  cashflowMonths: CashflowMonth[];
}

export function DashboardHeader({
  monthLabel,
  selectedMonth,
  totalMonths,
  onMonthChange,
  cashflowMonths,
}: DashboardHeaderProps) {
  return (
    <header className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">FinanceFlow</h1>
          <p className="text-muted-foreground text-sm mt-1">Sua visão financeira completa</p>
        </div>

        {/* Month/year filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1">
            {cashflowMonths.map((m, i) => (
              <button
                key={i}
                onClick={() => onMonthChange(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  i === selectedMonth
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {m.month.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
