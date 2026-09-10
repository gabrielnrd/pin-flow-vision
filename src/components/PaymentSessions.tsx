import { useMemo } from "react";
import { Layers } from "lucide-react";
import { useFinanceStore } from "@/stores/financeStore";
import { Checkbox } from "@/components/ui/checkbox";

const MONTH_MAP: Record<string, number> = {
  "Janeiro": 1, "Fevereiro": 2, "Março": 3, "Abril": 4, "Maio": 5, "Junho": 6,
  "Julho": 7, "Agosto": 8, "Setembro": 9, "Outubro": 10, "Novembro": 11, "Dezembro": 12,
};

/** Blocos de pagamento baseados nos dias de recebimento (5, 20 e 30).
 *  Cada recebimento cobre os vencimentos até a chegada do próximo. */
const SESSIONS = [
  { id: "s30", label: "Recebimento dia 30", range: "Venc. 1 – 4", from: 1, to: 4, note: "receita do mês anterior" },
  { id: "s5", label: "Recebimento dia 5", range: "Venc. 5 – 19", from: 5, to: 19, note: null },
  { id: "s20", label: "Recebimento dia 20", range: "Venc. 20 – 29", from: 20, to: 29, note: null },
  { id: "s30b", label: "Recebimento dia 30", range: "Venc. 30 – 31", from: 30, to: 31, note: "fecha o mês" },
] as const;

export function PaymentSessions() {
  const { banks, currentCashflow, updateInstallment } = useFinanceStore();

  const monthNum = MONTH_MAP[currentCashflow.month];
  const year = currentCashflow.year;

  const sessions = useMemo(() => {
    const items = banks
      .filter((b) => b.status !== "cancelado")
      .flatMap((bank) =>
        bank.installments
          .filter((inst) => {
            const d = new Date(inst.dueDate + "T00:00:00");
            return d.getMonth() + 1 === monthNum && d.getFullYear() === year;
          })
          .map((inst) => ({ bank, inst, day: new Date(inst.dueDate + "T00:00:00").getDate() }))
      );

    return SESSIONS.map((s) => {
      const group = items
        .filter((i) => i.day >= s.from && i.day <= s.to)
        .sort((a, b) => a.day - b.day);
      const total = group.reduce((sum, i) => sum + i.inst.installmentAmount, 0);
      const paidTotal = group
        .filter((i) => i.inst.status === "pago")
        .reduce((sum, i) => sum + i.inst.installmentAmount, 0);
      return { ...s, group, total, paidTotal };
    });
  }, [banks, monthNum, year]);

  const grandTotal = sessions.reduce((s, x) => s + x.total, 0);

  return (
    <div className="glass-card rounded-2xl p-5 animate-float-in">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Sessões de Pagamento — {currentCashflow.month}
          </h3>
        </div>
        <span className="text-sm text-money text-foreground">
          R$ {grandTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {sessions.map((s) => {
          const done = s.group.length > 0 && s.paidTotal >= s.total;
          return (
            <div
              key={s.id}
              className={`rounded-xl border p-3.5 flex flex-col transition-colors ${
                done
                  ? "border-income/30 bg-income/5"
                  : s.group.length > 0
                    ? "border-border/60 bg-secondary/30"
                    : "border-dashed border-border/40 bg-transparent"
              }`}
            >
              <div className="mb-2.5">
                <p className="text-xs font-semibold text-foreground">{s.label}</p>
                <p className="text-[10px] text-muted-foreground">
                  {s.range}
                  {s.note ? ` · ${s.note}` : ""}
                </p>
              </div>

              {s.group.length === 0 ? (
                <p className="text-[11px] text-muted-foreground/70 py-3 text-center">Sem vencimentos 🎉</p>
              ) : (
                <div className="space-y-1.5 flex-1">
                  {s.group.map(({ bank, inst, day }) => {
                    const paid = inst.status === "pago";
                    return (
                      <div key={inst.id} className="flex items-center gap-1.5 text-xs group/item">
                        <Checkbox
                          checked={paid}
                          onCheckedChange={() =>
                            updateInstallment(bank.id, inst.id, { status: paid ? "pendente" : "pago" })
                          }
                          className="h-3.5 w-3.5 rounded border-border data-[state=checked]:bg-income data-[state=checked]:border-income"
                        />
                        <span className="text-[9px] text-muted-foreground/70 w-7 shrink-0">d.{day}</span>
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: bank.color.startsWith("#") ? bank.color : `hsl(${bank.color})` }}
                        />
                        <span className={`truncate flex-1 ${paid ? "line-through text-muted-foreground" : "text-muted-foreground"}`}>
                          {inst.description}
                          {inst.totalInstallments > 1 && (
                            <span className="text-[9px] text-muted-foreground/70"> {inst.currentInstallment}/{inst.totalInstallments}</span>
                          )}
                        </span>
                        <span className={`text-money shrink-0 ${paid ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {inst.installmentAmount.toLocaleString("pt-BR")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {s.group.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-border/40 flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground">
                    {done ? "Sessão quitada ✓" : `Falta R$ ${(s.total - s.paidTotal).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`}
                  </span>
                  <span className={`text-sm text-money ${done ? "text-income" : "text-expense"}`}>
                    R$ {s.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
