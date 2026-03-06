import { useState, useMemo } from "react";
import { Calculator, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { type Creditor } from "@/data/financialData";

interface SnowballCalculatorProps {
  creditors: Creditor[];
}

export function SnowballCalculator({ creditors }: SnowballCalculatorProps) {
  const [extraMonthly, setExtraMonthly] = useState(200);

  const activeCreditors = creditors.filter((c) => c.amountPaid < c.totalDebt);

  const projections = useMemo(() => {
    if (activeCreditors.length === 0 || extraMonthly <= 0) return [];

    // Snowball: smallest debt first, split extra evenly for simplicity
    const sorted = [...activeCreditors].sort((a, b) => (a.totalDebt - a.amountPaid) - (b.totalDebt - b.amountPaid));
    
    return sorted.map((c) => {
      const remaining = c.totalDebt - c.amountPaid;
      const months = Math.ceil(remaining / extraMonthly);
      const now = new Date();
      const payoffDate = new Date(now.getFullYear(), now.getMonth() + months, 1);
      const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      return {
        name: c.name,
        remaining,
        months,
        payoffLabel: `${monthNames[payoffDate.getMonth()]}/${payoffDate.getFullYear()}`,
      };
    });
  }, [activeCreditors, extraMonthly]);

  if (activeCreditors.length === 0) return null;

  return (
    <div className="masonry-item glass-card rounded-2xl p-5 animate-float-in" style={{ animationDelay: "350ms" }}>
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Simulador Snowball</h3>
      </div>

      <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-secondary/40">
        <span className="text-xs text-muted-foreground whitespace-nowrap">Aporte extra/mês:</span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">R$</span>
          <Input
            type="number"
            value={extraMonthly}
            onChange={(e) => setExtraMonthly(Math.max(0, Number(e.target.value)))}
            className="h-7 text-xs rounded-lg w-20"
          />
        </div>
      </div>

      <div className="space-y-2.5">
        {projections.map((p) => (
          <div key={p.name} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
            <div>
              <p className="text-sm text-foreground">{p.name}</p>
              <p className="text-[11px] text-muted-foreground">
                Restam R$ {p.remaining.toLocaleString("pt-BR")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-income">{p.payoffLabel}</p>
              <p className="text-[10px] text-muted-foreground">{p.months} {p.months === 1 ? "mês" : "meses"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
