import { useState, useEffect, useCallback } from "react";
import { useFinanceStore } from "@/stores/financeStore";
import { CreditCard, AlertTriangle, ChevronUp, ChevronDown, Wallet } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  pago: "Pago",
  parcial: "Parcial",
};

const statusStyles: Record<string, string> = {
  pendente: "bg-expense/20 text-expense border-expense/30",
  pago: "bg-income/20 text-income border-income/30",
  parcial: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const bankGradients: Record<string, string> = {
  "bank-nubank": "linear-gradient(135deg, hsl(280,97%,38%), hsl(300,80%,25%))",
  "bank-inter": "linear-gradient(135deg, hsl(27,100%,50%), hsl(15,90%,40%))",
  "bank-c6": "linear-gradient(135deg, hsl(220,10%,20%), hsl(220,15%,12%))",
  "bank-itau": "linear-gradient(135deg, #F88104, hsl(25,90%,35%))",
  "bank-bb": "linear-gradient(135deg, hsl(45,100%,45%), hsl(45,80%,30%))",
  "bank-other": "linear-gradient(135deg, #1B7085, hsl(190,70%,22%))",
};

const bankTextColor: Record<string, string> = {
  "bank-nubank": "text-white",
  "bank-inter": "text-white",
  "bank-c6": "text-gray-300",
  "bank-itau": "text-white",
  "bank-bb": "text-gray-900",
  "bank-other": "text-white",
};

function CarteiraCard({ bank, isActive, scale = 1 }: { bank: any; isActive: boolean; scale?: number }) {
  const usagePercent = Math.min((bank.limitUsed / bank.limitTotal) * 100, 100);
  const isOverLimit = bank.limitUsed > bank.limitTotal;
  const freeAmount = bank.limitTotal - bank.limitUsed;
  const gradient = bankGradients[bank.color] || bankGradients["bank-other"];
  const textColor = bankTextColor[bank.color] || "text-white";
  const cardNumber = `•••• •••• •••• ${String(Math.abs(bank.name.split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0) % 10000)).padStart(4, "0")}`;

  return (
    <div
      className={cn(
        "w-[320px] h-[200px] rounded-2xl overflow-hidden transition-all duration-500 select-none shrink-0",
        textColor,
        isActive ? "shadow-2xl shadow-primary/40" : "opacity-40 blur-[1px]"
      )}
      style={{ background: gradient, transform: `scale(${scale})` }}
    >
      <div className="relative w-full h-full p-4 flex flex-col justify-between">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h3 className="font-bold text-lg tracking-wide">{bank.name}</h3>
            <p className="text-[10px] opacity-60 mt-0.5">{bank.installments.filter((i: any) => i.status !== "pago").length} parcelas ativas</p>
          </div>
          <Badge variant="outline" className={cn("text-[9px] border-white/30", statusStyles[bank.status] || "")}>
            {statusLabels[bank.status] || bank.status}
          </Badge>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <div className="w-9 h-6 rounded bg-gradient-to-br from-yellow-300/80 to-yellow-600/80 border border-yellow-400/40" />
          <span className="text-xs font-mono tracking-[0.18em] opacity-80">{cardNumber}</span>
        </div>

        <div className="relative z-10 space-y-1.5">
          <div>
            <div className="flex justify-between text-[9px] opacity-70 mb-0.5">
              <span>Limite usado</span>
              <span>{usagePercent.toFixed(0)}%</span>
            </div>
            <Progress value={usagePercent} className="h-1 bg-white/20 [&>div]:bg-white/80" />
          </div>
          <div className="flex justify-between items-end text-xs">
            <div>
              <p className="text-[9px] opacity-60">Limite</p>
              <p className="font-bold tabular-nums">R$ {bank.limitTotal.toLocaleString("pt-BR")}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] opacity-60">Usado</p>
              <p className="font-bold tabular-nums">R$ {bank.limitUsed.toLocaleString("pt-BR")}</p>
            </div>
            <div className="text-right">
              {isOverLimit ? (
                <div className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <div>
                    <p className="text-[9px] opacity-60">Excedido</p>
                    <p className="font-bold tabular-nums">R$ {Math.abs(freeAmount).toLocaleString("pt-BR")}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-[9px] opacity-60">Livre</p>
                  <p className="font-bold tabular-nums">R$ {freeAmount.toLocaleString("pt-BR")}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-3 right-4 opacity-10">
          <CreditCard className="w-10 h-10" />
        </div>
      </div>
    </div>
  );
}

export default function CarteiraPage() {
  const { banks } = useFinanceStore();
  const [activeIndex, setActiveIndex] = useState(0);

  const count = banks.length;

  const prev = useCallback(() => setActiveIndex((p) => (p - 1 + count) % count), [count]);
  const next = useCallback(() => setActiveIndex((p) => (p + 1) % count), [count]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") prev();
      if (e.key === "ArrowDown") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next]);

  const totalDebt = banks.reduce((s, b) => s + b.debtFinal, 0);
  const totalLimit = banks.reduce((s, b) => s + b.limitTotal, 0);
  const totalUsed = banks.reduce((s, b) => s + b.limitUsed, 0);

  if (count === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Nenhum cartão cadastrado.</p>
      </div>
    );
  }

  // Ferris wheel: each card positioned on a vertical circle
  const wheelRadius = 220;
  const angleStep = count > 0 ? 360 / count : 360;

  // Build positions for each card relative to active
  const getCardStyle = (index: number) => {
    const offset = index - activeIndex;
    // Normalize to -count/2 .. count/2
    let normalizedOffset = offset;
    if (normalizedOffset > count / 2) normalizedOffset -= count;
    if (normalizedOffset < -count / 2) normalizedOffset += count;

    const angle = (normalizedOffset * angleStep * Math.PI) / 180;
    // Clockwise: positive offset goes down-right, negative goes up-left
    const x = Math.sin(angle) * wheelRadius * 0.3;
    const y = -Math.cos(angle) * wheelRadius + wheelRadius;
    const scale = Math.cos(angle) * 0.3 + 0.7; // 0.4 to 1.0
    const zIndex = Math.round(scale * 100);
    const opacity = Math.abs(normalizedOffset) <= 2 ? 1 : 0;

    return {
      transform: `translate(${x}px, ${y}px) scale(${scale})`,
      zIndex,
      opacity,
      transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
    };
  };

  const activeBank = banks[activeIndex];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-1">
            <Wallet className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Carteira Digital</h1>
          </div>
          <p className="text-muted-foreground text-xs">Roda-gigante de cartões</p>
        </div>

        {/* Main layout: wheel left, details right */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 justify-center">
          {/* Ferris Wheel */}
          <div className="relative flex-shrink-0" style={{ width: 360, height: wheelRadius * 2 + 220 }}>
            {/* Navigation */}
            <button
              onClick={prev}
              className="absolute top-0 left-1/2 -translate-x-1/2 z-30 w-10 h-10 rounded-full bg-card/80 backdrop-blur border border-border/50 flex items-center justify-center text-foreground hover:bg-primary/20 hover:text-primary transition-all shadow-lg"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 w-10 h-10 rounded-full bg-card/80 backdrop-blur border border-border/50 flex items-center justify-center text-foreground hover:bg-primary/20 hover:text-primary transition-all shadow-lg"
            >
              <ChevronDown className="w-5 h-5" />
            </button>

            {/* Cards container */}
            <div className="absolute inset-0 flex items-start justify-center" style={{ top: 50 }}>
              {banks.map((bank, i) => (
                <div
                  key={bank.id}
                  className="absolute cursor-pointer"
                  style={getCardStyle(i)}
                  onClick={() => setActiveIndex(i)}
                >
                  <CarteiraCard bank={bank} isActive={i === activeIndex} />
                </div>
              ))}
            </div>

            {/* Dots */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {banks.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    i === activeIndex ? "bg-primary scale-125" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="flex-1 max-w-xl w-full space-y-4">
            {activeBank && (
              <div className="rounded-2xl bg-card/60 backdrop-blur border border-border/50 p-5 space-y-4 animate-fade-in">
                <h2 className="text-xl font-bold text-foreground">{activeBank.name}</h2>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-background/50 p-3">
                    <p className="text-[10px] text-muted-foreground">Limite</p>
                    <p className="text-base font-bold text-foreground tabular-nums">
                      R$ {activeBank.limitTotal.toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div className="rounded-xl bg-background/50 p-3">
                    <p className="text-[10px] text-muted-foreground">Usado</p>
                    <p className="text-base font-bold text-foreground tabular-nums">
                      R$ {activeBank.limitUsed.toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div className="rounded-xl bg-background/50 p-3">
                    <p className="text-[10px] text-muted-foreground">Dívida</p>
                    <p className="text-base font-bold text-foreground tabular-nums">
                      R$ {activeBank.debtFinal.toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>

                {activeBank.installments.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">Parcelas</h3>
                    <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                      {activeBank.installments.map((inst) => (
                        <div key={inst.id} className="flex items-center justify-between rounded-lg bg-background/40 px-3 py-2 text-sm">
                          <span className="text-foreground truncate flex-1">{inst.description}</span>
                          <span className="text-muted-foreground text-xs mx-2">{inst.currentInstallment}/{inst.totalInstallments}</span>
                          <span className="font-semibold text-foreground tabular-nums">
                            R$ {inst.installmentAmount.toLocaleString("pt-BR")}
                          </span>
                          <Badge variant="outline" className={cn("ml-2 text-[9px]", statusStyles[inst.status] || "")}>
                            {inst.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-card/60 backdrop-blur border border-border/50 p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Limite Total</p>
                <p className="text-lg font-bold text-foreground tabular-nums">R$ {totalLimit.toLocaleString("pt-BR")}</p>
              </div>
              <div className="rounded-xl bg-card/60 backdrop-blur border border-border/50 p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Total Usado</p>
                <p className="text-lg font-bold text-foreground tabular-nums">R$ {totalUsed.toLocaleString("pt-BR")}</p>
              </div>
              <div className="rounded-xl bg-card/60 backdrop-blur border border-border/50 p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Dívida Total</p>
                <p className="text-lg font-bold text-expense tabular-nums">R$ {totalDebt.toLocaleString("pt-BR")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
