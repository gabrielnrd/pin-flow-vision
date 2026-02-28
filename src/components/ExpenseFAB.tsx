import { Plus } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ExpenseFAB() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 rounded-xl border-income/30 hover:bg-income/10 hover:border-income/50 text-income"
              onClick={() => setOpen(false)}
            >
              <span className="text-2xl">↑</span>
              <span className="text-sm">Receita</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 rounded-xl border-expense/30 hover:bg-expense/10 hover:border-expense/50 text-expense"
              onClick={() => setOpen(false)}
            >
              <span className="text-2xl">↓</span>
              <span className="text-sm">Despesa</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Funcionalidade completa em breve. Conecte ao Lovable Cloud para persistir dados.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
