import { useMemo, useState } from "react";
import { useFinanceStore } from "@/stores/financeStore";
import { EXPENSE_CATEGORIES, suggestCategory } from "@/data/categories";
import { Grid3x3 } from "lucide-react";

const MONTH_MAP: Record<string, number> = {
  Janeiro: 1, Fevereiro: 2, Março: 3, Abril: 4, Maio: 5, Junho: 6,
  Julho: 7, Agosto: 8, Setembro: 9, Outubro: 10, Novembro: 11, Dezembro: 12,
};
const MONTHS_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function MonthCategoryHeatmap() {
  const store = useFinanceStore();
  const [hover, setHover] = useState<{ cat: string; month: string; value: number } | null>(null);

  const { matrix, monthLabels, max } = useMemo(() => {
    const monthLabels = store.cashflowMonths.map((m) => `${MONTHS_SHORT[(MONTH_MAP[m.month] || 1) - 1]}/${String(m.year).slice(2)}`);
    const matrix: Record<string, number[]> = {};
    EXPENSE_CATEGORIES.forEach((c) => { matrix[c.id] = new Array(store.cashflowMonths.length).fill(0); });

    store.cashflowMonths.forEach((m, i) => {
      m.expenses.forEach((e) => {
        const cat = e.category || suggestCategory(e.label);
        if (matrix[cat]) matrix[cat][i] += e.amount;
      });
      const monthNum = MONTH_MAP[m.month];
      store.banks.forEach((b) => {
        b.installments.forEach((inst) => {
          const d = new Date(inst.dueDate + "T00:00:00");
          if (d.getMonth() + 1 === monthNum && d.getFullYear() === m.year) {
            const cat = inst.category || suggestCategory(inst.description);
            if (matrix[cat]) matrix[cat][i] += inst.installmentAmount;
          }
        });
      });
    });

    let max = 0;
    Object.values(matrix).forEach((row) => row.forEach((v) => { if (v > max) max = v; }));
    return { matrix, monthLabels, max: max || 1 };
  }, [store.cashflowMonths, store.banks]);

  return (
    <div className="rounded-2xl bg-card border border-border/50 p-5">
      <div className="flex items-center gap-3 mb-5">
        <Grid3x3 className="w-5 h-5 text-primary" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">Comparativo Mês a Mês</h3>
          <p className="text-xs text-muted-foreground">Heatmap de gastos por categoria</p>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-none">
        <div className="min-w-fit">
          {/* Header */}
          <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: `140px repeat(${monthLabels.length}, minmax(46px, 1fr))` }}>
            <div />
            {monthLabels.map((m) => (
              <div key={m} className="text-[10px] text-center text-muted-foreground font-medium">{m}</div>
            ))}
          </div>

          {/* Rows */}
          {EXPENSE_CATEGORIES.map((cat) => {
            const row = matrix[cat.id];
            const hasAny = row.some((v) => v > 0);
            if (!hasAny) return null;
            return (
              <div key={cat.id} className="grid gap-1 mb-1" style={{ gridTemplateColumns: `140px repeat(${monthLabels.length}, minmax(46px, 1fr))` }}>
                <div className="flex items-center gap-1.5 text-xs text-foreground px-1">
                  <span>{cat.emoji}</span>
                  <span className="truncate">{cat.label}</span>
                </div>
                {row.map((v, i) => {
                  const intensity = v / max;
                  const isHover = hover?.cat === cat.id && hover?.month === monthLabels[i];
                  return (
                    <div
                      key={i}
                      className="aspect-square rounded-md flex items-center justify-center cursor-pointer transition-all hover:ring-2 hover:ring-primary"
                      style={{
                        backgroundColor: v > 0 ? `hsl(var(--primary) / ${0.1 + intensity * 0.7})` : "hsl(var(--secondary) / 0.3)",
                      }}
                      onMouseEnter={() => setHover({ cat: cat.id, month: monthLabels[i], value: v })}
                      onMouseLeave={() => setHover(null)}
                    >
                      {isHover && v > 0 && (
                        <span className="text-[9px] font-medium text-foreground bg-background/80 px-1 rounded">{fmt(v)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-muted-foreground">
        <span>Menos</span>
        {[0.1, 0.3, 0.5, 0.7, 0.9].map((o) => (
          <div key={o} className="w-4 h-4 rounded" style={{ backgroundColor: `hsl(var(--primary) / ${o})` }} />
        ))}
        <span>Mais</span>
      </div>
      {hover && hover.value > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          <span className="font-medium text-foreground">{EXPENSE_CATEGORIES.find((c) => c.id === hover.cat)?.label}</span> · {hover.month} · <span className="text-money">{fmt(hover.value)}</span>
        </p>
      )}
    </div>
  );
}
