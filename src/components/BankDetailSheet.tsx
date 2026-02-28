import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { CreditCard, AlertTriangle } from "lucide-react";
import { type Bank } from "@/data/financialData";

interface BankDetailSheetProps {
  bank: Bank | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusStyles = {
  pendente: "bg-expense/20 text-expense border-expense/30",
  pago: "bg-income/20 text-income border-income/30",
  atrasado: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

export function BankDetailSheet({ bank, open, onOpenChange }: BankDetailSheetProps) {
  if (!bank) return null;

  const isOverLimit = bank.limitUsed > bank.limitTotal;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="glass-card border-l-border/30 w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-${bank.color}/20 flex items-center justify-center`}>
              <CreditCard className={`w-6 h-6 text-${bank.color}`} />
            </div>
            <div>
              <SheetTitle className="text-foreground text-lg">{bank.name}</SheetTitle>
              <p className="text-sm text-muted-foreground">{bank.installments.length} parcelas registradas</p>
            </div>
          </div>
        </SheetHeader>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-secondary/50">
            <p className="text-xs text-muted-foreground">Limite Total</p>
            <p className="text-lg text-money text-foreground">R$ {bank.limitTotal.toLocaleString("pt-BR")}</p>
          </div>
          <div className="p-3 rounded-xl bg-secondary/50">
            <p className="text-xs text-muted-foreground">Usado</p>
            <p className={`text-lg text-money ${isOverLimit ? "text-expense" : "text-foreground"}`}>
              R$ {bank.limitUsed.toLocaleString("pt-BR")}
            </p>
          </div>
        </div>

        {isOverLimit && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-expense/10 border border-expense/20 mb-6 animate-pulse-danger">
            <AlertTriangle className="w-5 h-5 text-expense" />
            <span className="text-sm text-expense font-medium">
              Limite excedido em R$ {(bank.limitUsed - bank.limitTotal).toLocaleString("pt-BR")}
            </span>
          </div>
        )}

        {/* Installments */}
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Parcelas em Aberto
        </h4>
        <div className="space-y-2">
          {bank.installments.map((inst) => (
            <div
              key={inst.id}
              className="p-4 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{inst.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Parcela {inst.currentInstallment} de {inst.totalInstallments}
                  </p>
                </div>
                <Badge variant="outline" className={`text-[10px] ${statusStyles[inst.status]}`}>
                  {inst.status === "pago" ? "Pago" : inst.status === "atrasado" ? "Atrasado" : "Pendente"}
                </Badge>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-muted-foreground">Vencimento</p>
                  <p className="text-sm text-foreground">
                    {new Date(inst.dueDate + "T00:00:00").toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Valor da Parcela</p>
                  <p className="text-lg text-money text-foreground">
                    R$ {inst.installmentAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              {/* Progress */}
              <div className="mt-2 pt-2 border-t border-border/30">
                <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                  <span>Progresso</span>
                  <span>{((inst.currentInstallment / inst.totalInstallments) * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(inst.currentInstallment / inst.totalInstallments) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Total: R$ {inst.totalAmount.toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
