import { Plus, Check, X, CreditCard, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinanceStore } from "@/stores/financeStore";
import { toast } from "@/hooks/use-toast";

type Mode = "income" | "expense" | "card" | null;

export function ExpenseFAB() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<Mode>(null);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  // card-specific
  const [bankId, setBankId] = useState<string>("");
  const [parcels, setParcels] = useState("1");
  const [firstDate, setFirstDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const { selectedMonth, addCashflowItem, banks, addInstallment } = useFinanceStore();

  const reset = () => {
    setType(null); setLabel(""); setAmount("");
    setBankId(""); setParcels("1");
    setFirstDate(new Date().toISOString().slice(0, 10));
  };

  const handleAddSimple = () => {
    const val = parseFloat(amount);
    if (!label.trim() || isNaN(val) || val <= 0 || !type) return;
    addCashflowItem(selectedMonth, type === "income" ? "incomes" : "expenses", label.trim(), val);
    reset(); setOpen(false);
    toast({ title: "Adicionado", description: `${label} • R$ ${val.toLocaleString("pt-BR")}` });
  };

  const handleAddCard = () => {
    const total = parseFloat(amount);
    const n = Math.max(1, parseInt(parcels) || 1);
    if (!label.trim() || isNaN(total) || total <= 0 || !bankId || !firstDate) return;
    const per = +(total / n).toFixed(2);
    const base = new Date(firstDate + "T00:00:00");
    for (let i = 0; i < n; i++) {
      const d = new Date(base.getFullYear(), base.getMonth() + i, base.getDate());
      addInstallment(bankId, {
        description: label.trim(),
        totalAmount: total,
        installmentAmount: per,
        currentInstallment: i + 1,
        totalInstallments: n,
        dueDate: d.toISOString().slice(0, 10),
        status: "pendente",
      });
    }
    reset(); setOpen(false);
    toast({
      title: "Gasto no cartão registrado",
      description: `${n}x de R$ ${per.toLocaleString("pt-BR")} • atualizado automaticamente no fluxo`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <button className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-primary text-primary-foreground animate-fab-breathe flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200 group">
          <Plus className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" />
        </button>
      </DialogTrigger>
      <DialogContent className="glass-card border-border/30 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Nova Transação</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {!type ? (
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="h-24 flex-col gap-2 rounded-xl border-income/30 hover:bg-income/10 hover:border-income/50 text-income"
                onClick={() => setType("income")}
              >
                <ArrowUp className="w-5 h-5" />
                <span className="text-xs">Receita</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-2 rounded-xl border-expense/30 hover:bg-expense/10 hover:border-expense/50 text-expense"
                onClick={() => setType("expense")}
              >
                <ArrowDown className="w-5 h-5" />
                <span className="text-xs">Despesa</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-2 rounded-xl border-primary/30 hover:bg-primary/10 hover:border-primary/50 text-primary"
                onClick={() => { setType("card"); if (banks[0]) setBankId(banks[0].id); }}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs">Cartão</span>
              </Button>
            </div>
          ) : type === "card" ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Gasto no cartão — gera parcelas automaticamente</p>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Descrição (ex: Tênis Nike)" className="rounded-xl" autoFocus />
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Valor total (R$)" className="rounded-xl" min={0} />
                <Input type="number" value={parcels} onChange={(e) => setParcels(e.target.value)} placeholder="Parcelas" className="rounded-xl" min={1} max={48} />
              </div>
              <Select value={bankId} onValueChange={setBankId}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Cartão" /></SelectTrigger>
                <SelectContent>
                  {banks.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div>
                <p className="text-xs text-muted-foreground mb-1">1ª parcela vence em</p>
                <Input type="date" value={firstDate} onChange={(e) => setFirstDate(e.target.value)} className="rounded-xl" />
              </div>
              {amount && parcels && (
                <div className="text-xs text-muted-foreground bg-secondary/30 rounded-lg p-2">
                  {parcels}x de <strong className="text-foreground">R$ {(parseFloat(amount || "0") / Math.max(1, parseInt(parcels) || 1)).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</strong> — refletirá automaticamente no fluxo de caixa
                </div>
              )}
              <div className="flex gap-2">
                <Button className="flex-1 rounded-xl gap-2" onClick={handleAddCard}>
                  <Check className="w-4 h-4" /> Adicionar
                </Button>
                <Button variant="outline" className="rounded-xl" onClick={reset}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {type === "income" ? "Nova Receita" : "Nova Despesa"}
              </p>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Descrição" className="rounded-xl" autoFocus />
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Valor (R$)" className="rounded-xl" min={0} />
              <div className="flex gap-2">
                <Button className="flex-1 rounded-xl gap-2" onClick={handleAddSimple}>
                  <Check className="w-4 h-4" /> Adicionar
                </Button>
                <Button variant="outline" className="rounded-xl" onClick={reset}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
