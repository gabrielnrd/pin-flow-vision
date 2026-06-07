import { useState } from "react";
import { useFinanceStore } from "@/stores/financeStore";
import { Landmark, Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AnimatedNumber } from "@/components/AnimatedNumber";

export function SavedBalanceWidget() {
  const store = useFinanceStore();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(store.savedBalance));

  const handleSave = () => {
    const val = parseFloat(value);
    if (!isNaN(val) && val >= 0) {
      store.setSavedBalance(val);
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setValue(String(store.savedBalance));
    setEditing(false);
  };

  return (
    <div className="glass-card rounded-2xl p-5 animate-float-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-income/15 flex items-center justify-center">
          <Landmark className="w-4.5 h-4.5 text-income" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Saldo em Conta</h3>
          <p className="text-xs text-muted-foreground">Guardado no banco (base projeção)</p>
        </div>
      </div>

      {editing ? (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-9 text-sm rounded-lg flex-1"
            autoFocus
            placeholder="R$ 0,00"
          />
          <button
            onClick={handleSave}
            className="p-2 rounded-lg hover:bg-income/20 text-income transition-colors"
            title="Salvar"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-expense/20 text-expense transition-colors"
            title="Cancelar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between group">
          <div>
            <p className="text-2xl text-money text-income">
              <AnimatedNumber value={store.savedBalance} prefix="R$ " decimals={0} />
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Saldo final projetado: R$ {store.projectedTotalBalance.toLocaleString("pt-BR")}
            </p>
          </div>
          <button
            onClick={() => {
              setValue(String(store.savedBalance));
              setEditing(true);
            }}
            className="p-2 rounded-lg hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
            title="Editar saldo"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
