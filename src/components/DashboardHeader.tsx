import { useMemo } from "react";
import { Filter, Sun, Moon, Sunrise, Sunset } from "lucide-react";
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

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { text: "Bom dia", icon: Sunrise, emoji: "☀️" };
  if (h >= 12 && h < 18) return { text: "Boa tarde", icon: Sun, emoji: "🌤️" };
  if (h >= 18 && h < 22) return { text: "Boa noite", icon: Sunset, emoji: "🌙" };
  return { text: "Boa noite", icon: Moon, emoji: "🌙" };
}

export function DashboardHeader({
  monthLabel,
  selectedMonth,
  totalMonths,
  onMonthChange,
  cashflowMonths,
}: DashboardHeaderProps) {
  const greeting = useMemo(() => getGreeting(), []);

  return (
    <header className="mb-6 animate-float-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
            {greeting.emoji} {greeting.text}
          </p>
          <h1 className="text-3xl font-bold text-gradient tracking-tight">
            Gabriel
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Sua visão financeira atualizada
          </p>
        </div>

        {/* Month/year filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto min-w-0">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex gap-1 bg-secondary/40 rounded-xl p-1 overflow-x-auto scrollbar-none flex-1 sm:flex-initial">
            {cashflowMonths.map((m, i) => (
              <button
                key={i}
                onClick={() => onMonthChange(i)}
                className={`shrink-0 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all duration-200 ${
                  i === selectedMonth
                    ? "bg-primary/20 text-primary shadow-sm shadow-primary/10 pill-active"
                    : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
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
