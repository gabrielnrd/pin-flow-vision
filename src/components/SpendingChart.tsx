import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { type Bank } from "@/data/financialData";
import { useTheme } from "@/hooks/use-theme";

interface SpendingChartProps {
  banks: Bank[];
}

const BANK_COLORS: Record<string, string> = {
  nubank: "#8A05BE",
  inter: "#FF7A00",
  c6: "#2C2C2E",
  itau: "#EC7000",
  bb: "#FFCD00",
};

export function SpendingChart({ banks }: SpendingChartProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const data = banks.map((b) => ({
    name: b.name,
    value: b.debtFinal,
    color: BANK_COLORS[b.id] || "#888",
  }));

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="glass-card rounded-2xl p-5 animate-float-in" style={{ animationDelay: "100ms" }}>
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
        Distribuição por Banco
      </h3>

      <div className="flex items-center gap-4">
        <div className="w-32 h-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR")}`}
                contentStyle={{
                  background: isLight ? "hsl(0 0% 100% / 0.95)" : "hsl(240 6% 10% / 0.95)",
                  border: `1px solid ${isLight ? "hsl(240 5% 87%)" : "hsl(240 5% 25% / 0.4)"}`,
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: isLight ? "hsl(240 10% 10%)" : "hsl(0 0% 95%)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2 flex-1">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-xs text-muted-foreground flex-1">{d.name}</span>
              <span className="text-xs text-money text-foreground">
                {((d.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border/50 text-center relative overflow-hidden group/total">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-expense/[0.04] to-transparent opacity-0 group-hover/total:opacity-100 transition-opacity duration-500" />
        <p className="text-xs text-muted-foreground">Dívida Total em Cartões</p>
        <p className="text-xl text-money text-expense">R$ {total.toLocaleString("pt-BR")}</p>
      </div>
    </div>
  );
}
