import { useState } from "react";
import { useFinanceStore } from "@/stores/financeStore";
import { Target, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function CircularProgress({ percent, color, size = 100 }: { percent: number; color: string; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(240 5% 16%)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={`hsl(${color})`}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
}

export default function GoalsPage() {
  const { goals, depositToGoal } = useFinanceStore();
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");

  const handleDeposit = () => {
    if (!depositGoalId || !depositAmount) return;
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;
    depositToGoal(depositGoalId, amount);
    setDepositGoalId(null);
    setDepositAmount("");
  };

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0);
  const overallPercent = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8 animate-float-in">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Objetivos</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Acompanhe seus sonhos e metas financeiras
        </p>

        {/* Overall progress */}
        <div className="glass-card rounded-2xl p-5 mt-4 flex items-center gap-6">
          <CircularProgress percent={overallPercent} color="265 80% 50%" size={80} />
          <div>
            <p className="text-xs text-muted-foreground">Progresso Geral</p>
            <p className="text-2xl text-money text-foreground">{overallPercent.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              R$ {totalSaved.toLocaleString("pt-BR")} de R$ {totalTarget.toLocaleString("pt-BR")}
            </p>
          </div>
        </div>
      </div>

      {/* Goals grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {goals.map((goal, i) => {
          const pct = goal.targetAmount > 0 ? (goal.savedAmount / goal.targetAmount) * 100 : 0;
          const remaining = goal.targetAmount - goal.savedAmount;
          return (
            <div
              key={goal.id}
              className="glass-card-hover rounded-2xl p-5 animate-float-in relative overflow-hidden"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Glow */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at top right, hsl(${goal.color}), transparent 60%)`,
                }}
              />

              <div className="relative z-10">
                {/* Icon */}
                <div className="text-4xl mb-4">{goal.image}</div>

                <h3 className="text-lg font-semibold text-foreground mb-1">{goal.title}</h3>

                {/* Circular progress */}
                <div className="flex items-center gap-4 my-4">
                  <CircularProgress percent={pct} color={goal.color} size={72} />
                  <div>
                    <p className="text-2xl text-money text-foreground">{pct.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">concluído</p>
                  </div>
                </div>

                {/* Values */}
                <div className="space-y-1 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guardado</span>
                    <span className="text-money text-income">R$ {goal.savedAmount.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Faltam</span>
                    <span className="text-money text-foreground">R$ {remaining.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Meta</span>
                    <span className="text-money text-foreground">R$ {goal.targetAmount.toLocaleString("pt-BR")}</span>
                  </div>
                </div>

                {/* Deposit button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl border-border/50 hover:border-primary/50 gap-2"
                  onClick={() => setDepositGoalId(goal.id)}
                  disabled={remaining <= 0}
                >
                  <Plus className="w-4 h-4" />
                  {remaining <= 0 ? "Meta atingida! 🎉" : "Depositar"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deposit dialog */}
      <Dialog open={!!depositGoalId} onOpenChange={(open) => !open && setDepositGoalId(null)}>
        <DialogContent className="glass-card border-border/30 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Depositar no Objetivo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              {goals.find((g) => g.id === depositGoalId)?.title}
            </p>
            <Input
              type="number"
              placeholder="Valor (R$)"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="rounded-xl"
              min={0}
            />
            <Button className="w-full rounded-xl gap-2" onClick={handleDeposit}>
              <ArrowRight className="w-4 h-4" /> Confirmar Depósito
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
