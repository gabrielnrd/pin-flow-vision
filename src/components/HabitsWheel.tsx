import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Disc3, Sparkles, Check, Flame, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Habit = {
  id: string;
  label: string;
  icon: string;
  detail: string;
};

const HABITS: Habit[] = [
  { id: "breath", label: "Respiração", icon: "🌬️", detail: "4-7-8 por 3 minutos. Reduz o pico de ansiedade que antecede a fissura." },
  { id: "walk", label: "Caminhada", icon: "🚶", detail: "20 minutos de caminhada. Dopamina natural, sem custo." },
  { id: "water", label: "Hidratar", icon: "💧", detail: "500ml de água agora. Cérebro desidratado decide pior." },
  { id: "journal", label: "Diário", icon: "📓", detail: "Escreva 5 linhas sobre o gatilho de hoje e como você reagiu." },
  { id: "call", label: "Contato", icon: "📞", detail: "Fale com alguém de confiança por 5 minutos. Isolamento alimenta recaída." },
  { id: "sun", label: "Sol", icon: "☀️", detail: "15 minutos de luz natural. Regula sono e humor." },
  { id: "train", label: "Treino", icon: "💪", detail: "15 minutos de esforço físico intenso. Queima o impulso." },
  { id: "read", label: "Leitura", icon: "📖", detail: "10 páginas de algo que te constrói. Foco longo religa o córtex." },
  { id: "money", label: "Finanças", icon: "🪙", detail: "Registre um gasto no dashboard. Controle visível = controle real." },
  { id: "sleep", label: "Sono", icon: "🌙", detail: "Sem telas 45 minutos antes de dormir." },
  { id: "cook", label: "Comer bem", icon: "🥗", detail: "Uma refeição de verdade, sem pressa." },
  { id: "gratitude", label: "Gratidão", icon: "🙏", detail: "Liste 3 coisas que você não quer perder. Elas são o motivo." },
];

const SEGMENT_COLORS = [
  "hsl(var(--primary))",
  "hsl(265 60% 45%)",
  "hsl(var(--income))",
  "hsl(190 65% 40%)",
  "hsl(27 85% 47%)",
  "hsl(280 60% 50%)",
];

const STORE_KEY = "neuro-habits-wheel";

type WheelState = {
  date: string;
  done: string[];
  streak: number;
  lastCompleteDate: string | null;
  spins: number;
};

const today = () => new Date().toISOString().slice(0, 10);

function loadState(): WheelState {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as WheelState;
      if (parsed.date === today()) return parsed;
      return { ...parsed, date: today(), done: [], spins: 0 };
    }
  } catch { /* ignore */ }
  return { date: today(), done: [], streak: 0, lastCompleteDate: null, spins: 0 };
}

export function HabitsWheel() {
  const [state, setState] = useState<WheelState>(() => loadState());
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Habit | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const seg = 360 / HABITS.length;
  const donePct = (state.done.length / HABITS.length) * 100;

  const gradient = useMemo(
    () =>
      `conic-gradient(${HABITS.map((h, i) => {
        const c = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
        return `${c} ${i * seg}deg ${(i + 1) * seg}deg`;
      }).join(", ")})`,
    [seg]
  );

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    const pool = HABITS.filter((h) => !state.done.includes(h.id));
    const target = (pool.length ? pool : HABITS)[Math.floor(Math.random() * (pool.length || HABITS.length))];
    const idx = HABITS.findIndex((h) => h.id === target.id);
    // pointer at top (0deg) -> center of segment must land there
    const center = idx * seg + seg / 2;
    const turns = 5 + Math.floor(Math.random() * 3);
    const next = rotation + turns * 360 + (360 - (((rotation % 360) + center) % 360));
    setRotation(next);
    timer.current = window.setTimeout(() => {
      setSpinning(false);
      setResult(target);
      setState((s) => ({ ...s, spins: s.spins + 1 }));
    }, 4200);
  };

  const toggleHabit = (id: string) => {
    setState((s) => {
      const has = s.done.includes(id);
      const done = has ? s.done.filter((d) => d !== id) : [...s.done, id];
      let { streak, lastCompleteDate } = s;
      if (!has && done.length >= 3 && lastCompleteDate !== s.date) {
        streak = streak + 1;
        lastCompleteDate = s.date;
      }
      return { ...s, done, streak, lastCompleteDate };
    });
  };

  const resetDay = () => setState((s) => ({ ...s, done: [], spins: 0 }));

  return (
    <Card className="border-primary/20 overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Disc3 className={cn("w-5 h-5 text-primary", spinning && "animate-spin")} /> Wheel of Habits
            </CardTitle>
            <CardDescription>
              Gire a roda e execute o hábito sorteado. 3 hábitos por dia mantêm o streak vivo.
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-black text-primary leading-none tabular-nums">
                {state.done.length}<span className="text-muted-foreground/60 text-base">/{HABITS.length}</span>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Hoje</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-orange-500 leading-none tabular-nums flex items-center gap-1">
                <Flame className="w-5 h-5" />{state.streak}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Streak</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid lg:grid-cols-[auto_1fr] gap-8 items-start">
        {/* Wheel */}
        <div className="mx-auto flex flex-col items-center gap-4">
          <div className="relative" style={{ width: 300, height: 300 }}>
            {/* pointer */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-1 z-20">
              <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-primary drop-shadow" />
            </div>
            <div
              className="absolute inset-0 rounded-full border-4 border-border shadow-[0_0_50px_-10px_hsl(var(--primary)/0.5)]"
              style={{
                background: gradient,
                transform: `rotate(${rotation}deg)`,
                transition: "transform 4s cubic-bezier(0.12, 0.8, 0.08, 1)",
              }}
            >
              {HABITS.map((h, i) => {
                const angle = i * seg + seg / 2;
                return (
                  <div
                    key={h.id}
                    className="absolute inset-0 flex justify-center"
                    style={{ transform: `rotate(${angle}deg)` }}
                  >
                    <span
                      className="mt-4 text-xl select-none"
                      style={{ filter: state.done.includes(h.id) ? "grayscale(1) opacity(0.5)" : undefined }}
                    >
                      {h.icon}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* hub */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-20 h-20 rounded-full bg-card border-4 border-border flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={spin} disabled={spinning} className="gap-2" size="lg">
              <Disc3 className={cn("w-4 h-4", spinning && "animate-spin")} />
              {spinning ? "Girando..." : "Girar a roda"}
            </Button>
            <Button variant="outline" size="lg" onClick={resetDay} className="gap-2">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">Giros hoje: {state.spins}</p>
        </div>

        {/* Habit list */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground uppercase tracking-wider font-semibold">Progresso do dia</span>
              <span className="font-bold text-foreground">{Math.round(donePct)}%</span>
            </div>
            <Progress value={donePct} className="h-2" />
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {HABITS.map((h) => {
              const done = state.done.includes(h.id);
              return (
                <button
                  key={h.id}
                  onClick={() => toggleHabit(h.id)}
                  className={cn(
                    "text-left flex items-start gap-3 rounded-xl border p-3 transition-all hover:-translate-y-0.5",
                    done ? "border-primary/50 bg-primary/10" : "border-border bg-secondary/30"
                  )}
                >
                  <span className="text-xl leading-none">{h.icon}</span>
                  <div className="min-w-0">
                    <p className={cn("text-sm font-semibold flex items-center gap-1", done && "text-primary")}>
                      {h.label}
                      {done && <Check className="w-3.5 h-3.5" />}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{h.detail}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>

      {/* Result dialog */}
      <Dialog open={!!result} onOpenChange={(o) => !o && setResult(null)}>
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader className="items-center">
            <div className="text-xs font-bold uppercase tracking-widest text-primary">Hábito sorteado</div>
            <div className="text-6xl py-2">{result?.icon}</div>
            <DialogTitle className="text-2xl">{result?.label}</DialogTitle>
            <DialogDescription>{result?.detail}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:flex-col gap-2">
            <Button
              className="w-full gap-2"
              onClick={() => {
                if (result && !state.done.includes(result.id)) toggleHabit(result.id);
                setResult(null);
              }}
            >
              <Check className="w-4 h-4" /> Concluí agora
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setResult(null)}>
              Depois
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
