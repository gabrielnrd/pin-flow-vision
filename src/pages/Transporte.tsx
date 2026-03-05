import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Car, Plus, Trash2, Pencil, Check, X, Wallet, TrendingDown, DollarSign } from "lucide-react";

interface TransportEntry {
  id: string;
  service: string;
  amount: number;
  date: string;
}

export default function TransportePage() {
  const [totalBalance, setTotalBalance] = useState(0);
  const [editingBalance, setEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState("");
  const [entries, setEntries] = useState<TransportEntry[]>([]);

  // Add form
  const [service, setService] = useState("99");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const totalSpent = entries.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalBalance - totalSpent;

  const handleAddEntry = useCallback(() => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    setEntries((prev) => [
      { id: `t-${Date.now()}`, service, amount: val, date },
      ...prev,
    ]);
    setAmount("");
  }, [service, amount, date]);

  const handleRemove = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const startEditBalance = () => {
    setBalanceInput(totalBalance.toString());
    setEditingBalance(true);
  };

  const confirmBalance = () => {
    const v = parseFloat(balanceInput);
    if (!isNaN(v) && v >= 0) setTotalBalance(v);
    setEditingBalance(false);
  };

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8 max-w-[1600px] mx-auto space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Balance */}
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" /> Saldo Total
              </span>
              {!editingBalance && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={startEditBalance}>
                  <Pencil className="w-3 h-3" />
                </Button>
              )}
            </div>
            {editingBalance ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={balanceInput}
                  onChange={(e) => setBalanceInput(e.target.value)}
                  className="h-8 text-sm"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && confirmBalance()}
                />
                <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={confirmBalance}>
                  <Check className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setEditingBalance(false)}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <p className="text-2xl font-bold text-primary">{fmt(totalBalance)}</p>
            )}
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2">
              <TrendingDown className="w-3.5 h-3.5" /> Total Gasto
            </span>
            <p className="text-2xl font-bold text-destructive">{fmt(totalSpent)}</p>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2">
              <DollarSign className="w-3.5 h-3.5" /> Lucro Líquido
            </span>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-primary" : "text-destructive"}`}>
              {fmt(netProfit)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Entry */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="w-4 h-4" /> Adicionar Gasto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="99">99</option>
              <option value="Uber">Uber</option>
              <option value="Outro">Outro</option>
            </select>
            <Input
              type="number"
              placeholder="Valor (R$)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="sm:w-40"
              onKeyDown={(e) => e.key === "Enter" && handleAddEntry()}
            />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="sm:w-44"
            />
            <Button onClick={handleAddEntry} className="gap-2">
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Entries List */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Car className="w-4 h-4" /> Gastos de Transporte
            <span className="text-xs text-muted-foreground ml-auto">{entries.length} registros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum gasto registrado ainda.</p>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 hover:bg-secondary/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold px-2 py-0.5 rounded bg-primary/15 text-primary">
                      {entry.service}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(entry.date + "T12:00:00").toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-destructive">-{fmt(entry.amount)}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleRemove(entry.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
