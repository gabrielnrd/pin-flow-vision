import { useState, useRef, useEffect } from "react";
import { useFinance } from "@/stores/financeStore";
import { CreditCard, AlertTriangle, ChevronLeft, ChevronRight, Wallet } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusLabels = {
  pendente: "Pendente",
  pago: "Pago",
  parcial: "Parcial",
};

const statusStyles = {
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

function CarteiraCard({ bank, isActive }: { bank: any; isActive: boolean }) {
  const usagePercent = Math.min((bank.limitUsed / bank.limitTotal) * 100, 100);
  const isOverLimit = bank.limitUsed > bank.limitTotal;
  const freeAmount = bank.limitTotal - bank.limitUsed;
  const gradient = bankGradients[bank.color] || bankGradients["bank-other"];
  const textColor = bankTextColor[bank.color] || "text-white";
  const cardNumber = `•••• •••• •••• ${String(Math.abs(bank.name.split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0) % 10000)).padStart(4, "0")}`;

  return (
    <div
      className={cn(
        "w-[380px] h-[240px] rounded-2xl overflow-hidden transition-all duration-500 select-none",
        textColor,
        isActive ? "shadow-2xl shadow-primary/30" : "opacity-60"
      )}
      style={{ background: gradient }}
    >
      <div className="relative w-full h-full p-5 flex flex-col justify-between">
        {/* Pattern */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />

        {/* Top */}
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h3 className="font-bold text-xl tracking-wide">{bank.name}</h3>
            <p className="text-xs opacity-60 mt-0.5">{bank.installments.filter((i: any) => i.status !== "pago").length} parcelas ativas</p>
          </div>
          <Badge variant="outline" className={cn("text-[10px] border-white/30", statusStyles[bank.status as keyof typeof statusStyles])}>
            {statusLabels[bank.status as keyof typeof statusLabels]}
          </Badge>
        </div>

        {/* Chip + Number */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-8 rounded-md bg-gradient-to-br from-yellow-300/80 to-yellow-600/80 border border-yellow-400/40" />
          <span className="text-sm font-mono tracking-[0.2em] opacity-80">{cardNumber}</span>
        </div>

        {/* Bottom */}
        <div className="relative z-10 space-y-2">
          <div>
            <div className="flex justify-between text-[10px] opacity-70 mb-1">
              <span>Limite usado</span>
              <span>{usagePercent.toFixed(0)}%</span>
            </div>
            <Progress value={usagePercent} className="h-1.5 bg-white/20 [&>div]:bg-white/80" />
          </div>
          <div className="flex justify-between items-end text-sm">
            <div>
              <p className="text-[10px] opacity-60">Limite</p>
              <p className="font-bold tabular-nums">R$ {bank.limitTotal.toLocaleString("pt-BR")}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] opacity-60">Usado</p>
              <p className="font-bold tabular-nums">R$ {bank.limitUsed.toLocaleString("pt-BR")}</p>
            </div>
            <div className="text-right">
              {isOverLimit ? (
                <div className="flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <div>
                    <p className="text-[10px] opacity-60">Excedido</p>
                    <p className="font-bold tabular-nums">R$ {Math.abs(freeAmount).toLocaleString("pt-BR")}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-[10px] opacity-60">Livre</p>
                  <p className="font-bold tabular-nums">R$ {freeAmount.toLocaleString("pt-BR")}</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-white/10">
            <span className="text-[10px] opacity-60">Dívida Total</span>
            <span className="text-base font-bold tabular-nums">R$ {bank.debtFinal.toLocaleString("pt-BR")}</span>
          </div>
        </div>

        <div className="absolute bottom-4 right-5 opacity-15">
          <CreditCard className="w-12 h-12" />
        </div>
      </div>
    </div>
  );
}

export default function CarteiraPage() {
  const { banks } = useFinance();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const count = banks.length;
  const angleStep = count > 0 ? 360 / count : 360;
  const radius = count <= 2 ? 250 : count <= 4 ? 320 : 380;

  useEffect(() => {
    setRotation(-activeIndex * angleStep);
  }, [activeIndex, angleStep]);

  const prev = () => setActiveIndex((p) => (p - 1 + count) % count);
  const next = () => setActiveIndex((p) => (p + 1) % count);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    if (Math.abs(diff) > 80) {
      if (diff > 0) prev(); else next();
      setIsDragging(false);
    }
  };

  const handlePointerUp = () => setIsDragging(false);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [count]);

  // Summary
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

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 mb-2">
            <Wallet className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Carteira Digital</h1>
          </div>
          <p className="text-muted-foreground text-sm">Seus cartões em visão imersiva 3D</p>
        </div>

        {/* 3D Carousel */}
        <div
          ref={containerRef}
          className="relative mx-auto flex items-center justify-center select-none"
          style={{ height: "420px", perspective: "1200px" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <div
            className="relative w-[380px] h-[240px] transition-transform duration-700 ease-out"
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateY(${rotation}deg)`,
            }}
          >
            {banks.map((bank, i) => {
              const angle = i * angleStep;
              return (
                <div
                  key={bank.id}
                  className="absolute top-0 left-0 w-full h-full cursor-pointer"
                  style={{
                    transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                    backfaceVisibility: "hidden",
                  }}
                  onClick={() => setActiveIndex(i)}
                >
                  <CarteiraCard bank={bank} isActive={i === activeIndex} />
                </div>
              );
            })}
          </div>

          {/* Nav arrows */}
          <button
            onClick={prev}
            className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-card/80 backdrop-blur border border-border/50 flex items-center justify-center text-foreground hover:bg-primary/20 hover:text-primary transition-all shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-card/80 backdrop-blur border border-border/50 flex items-center justify-center text-foreground hover:bg-primary/20 hover:text-primary transition-all shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-2">
          {banks.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                i === activeIndex ? "bg-primary scale-125" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>

        {/* Active card detail */}
        <div className="mt-8 max-w-2xl mx-auto animate-fade-in">
          <div className="rounded-2xl bg-card/60 backdrop-blur border border-border/50 p-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground">{banks[activeIndex]?.name}</h2>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-xl bg-background/50 p-3">
                <p className="text-[10px] text-muted-foreground">Limite</p>
                <p className="text-lg font-bold text-foreground tabular-nums">
                  R$ {banks[activeIndex]?.limitTotal.toLocaleString("pt-BR")}
                </p>
              </div>
              <div className="rounded-xl bg-background/50 p-3">
                <p className="text-[10px] text-muted-foreground">Usado</p>
                <p className="text-lg font-bold text-foreground tabular-nums">
                  R$ {banks[activeIndex]?.limitUsed.toLocaleString("pt-BR")}
                </p>
              </div>
              <div className="rounded-xl bg-background/50 p-3">
                <p className="text-[10px] text-muted-foreground">Dívida</p>
                <p className="text-lg font-bold text-foreground tabular-nums">
                  R$ {banks[activeIndex]?.debtFinal.toLocaleString("pt-BR")}
                </p>
              </div>
            </div>

            {/* Installments list */}
            {banks[activeIndex]?.installments.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Parcelas</h3>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  {banks[activeIndex].installments.map((inst) => (
                    <div key={inst.id} className="flex items-center justify-between rounded-lg bg-background/40 px-3 py-2 text-sm">
                      <span className="text-foreground truncate flex-1">{inst.description}</span>
                      <span className="text-muted-foreground text-xs mx-2">{inst.currentInstallment}/{inst.totalInstallments}</span>
                      <span className="font-semibold text-foreground tabular-nums">
                        R$ {inst.installmentAmount.toLocaleString("pt-BR")}
                      </span>
                      <Badge variant="outline" className={cn("ml-2 text-[9px]", statusStyles[inst.status as keyof typeof statusStyles] || "")}>
                        {inst.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary footer */}
        <div className="mt-6 max-w-2xl mx-auto grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-card/60 backdrop-blur border border-border/50 p-4 text-center">
            <p className="text-xs text-muted-foreground">Limite Total</p>
            <p className="text-xl font-bold text-foreground tabular-nums">R$ {totalLimit.toLocaleString("pt-BR")}</p>
          </div>
          <div className="rounded-xl bg-card/60 backdrop-blur border border-border/50 p-4 text-center">
            <p className="text-xs text-muted-foreground">Total Usado</p>
            <p className="text-xl font-bold text-foreground tabular-nums">R$ {totalUsed.toLocaleString("pt-BR")}</p>
          </div>
          <div className="rounded-xl bg-card/60 backdrop-blur border border-border/50 p-4 text-center">
            <p className="text-xs text-muted-foreground">Dívida Total</p>
            <p className="text-xl font-bold text-expense tabular-nums">R$ {totalDebt.toLocaleString("pt-BR")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
