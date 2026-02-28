import { Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { type Creditor } from "@/data/financialData";

interface CreditorWidgetProps {
  creditors: Creditor[];
  totalDebt: number;
  totalPaid: number;
}

export function CreditorWidget({ creditors, totalDebt, totalPaid }: CreditorWidgetProps) {
  const overallPercent = totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 0;

  return (
    <div className="masonry-item glass-card rounded-2xl p-5 animate-float-in" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Credores</h3>
      </div>

      {/* Overall */}
      <div className="mb-4 p-3 rounded-xl bg-secondary/40">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Quitação Total</span>
          <span>{overallPercent.toFixed(0)}%</span>
        </div>
        <Progress value={overallPercent} className="h-2 bg-secondary [&>div]:bg-income" />
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-muted-foreground">
            Pago: <span className="text-income text-money">R$ {totalPaid.toLocaleString("pt-BR")}</span>
          </span>
          <span className="text-muted-foreground">
            Total: <span className="text-foreground text-money">R$ {totalDebt.toLocaleString("pt-BR")}</span>
          </span>
        </div>
      </div>

      {/* Individual creditors */}
      <div className="space-y-3">
        {creditors.map((c) => {
          const pct = c.totalDebt > 0 ? (c.amountPaid / c.totalDebt) * 100 : 0;
          const isComplete = pct >= 100;
          return (
            <div key={c.id}>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-sm ${isComplete ? "text-income line-through" : "text-foreground"}`}>
                  {c.name}
                </span>
                <span className="text-xs text-muted-foreground">{pct.toFixed(0)}%</span>
              </div>
              <Progress
                value={pct}
                className={`h-1.5 bg-secondary ${isComplete ? "[&>div]:bg-income" : "[&>div]:bg-primary"}`}
              />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-0.5">
                <span>R$ {c.amountPaid.toLocaleString("pt-BR")}</span>
                <span>R$ {c.totalDebt.toLocaleString("pt-BR")}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
