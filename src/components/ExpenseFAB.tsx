import { Plus, Check, X } from "lucide-react";
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
import { useFinanceStore } from "@/stores/financeStore";

export function ExpenseFAB() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"income" | "expense" | null>(null);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const { selectedMonth, addCashflowItem } = useFinanceStore();

  const handleAdd = () => {
    const val = parseFloat(amount);
    if (!label.trim() || isNaN(val) || val <= 0 || !type) return;
    addCashflowItem(selectedMonth, type === "income" ? "incomes" : "expenses", label.trim(), val);
    setLabel("");
    setAmount("");
    setType(null);
    setOpen(false);
  };

  const reset = () => { setType(null); setLabel(""); setAmount(""); };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <button className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
          <Plus className="w-6 h-6" />
        </button>
      </DialogTrigger>
      <DialogContent className="glass-card border-border/30 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Nova Transação</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {!type ? (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 rounded-xl border-income/30 hover:bg-income/10 hover:border-income/50 text-income"
                onClick={() => setType("income")}
              >
                <span className="text-2xl">↑</span>
                <span className="text-sm">Receita</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 rounded-xl border-expense/30 hover:bg-expense/10 hover:border-expense/50 text-expense"
                onClick={() => setType("expense")}
              >
                <span className="text-2xl">↓</span>
                <span className="text-sm">Despesa</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {type === "income" ? "Nova Receita" : "Nova Despesa"}
              </p>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Descrição" className="rounded-xl" autoFocus />
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Valor (R$)" className="rounded-xl" min={0} />
              <div className="flex gap-2">
                <Button className="flex-1 rounded-xl gap-2" onClick={handleAdd}>
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
