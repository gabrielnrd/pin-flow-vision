import { useMemo } from "react";
import { useFinanceStore } from "@/stores/financeStore";

type Severity =
  | "critico"
  | "atencao"
  | "desperdicio"
  | "oportunidade"
  | "risco"
  | "piora"
  | "positivo"
  | "alavanca";

interface Insight {
  severity: Severity;
  title: string;
  description: React.ReactNode;
}

const SEVERITY_STYLES: Record<
  Severity,
  { label: string; border: string; badgeBg: string; badgeText: string }
> = {
  critico: {
    label: "Crítico",
    border: "border-l-rose-500",
    badgeBg: "bg-rose-500/15",
    badgeText: "text-rose-400",
  },
  atencao: {
    label: "Atenção",
    border: "border-l-orange-500",
    badgeBg: "bg-orange-500/15",
    badgeText: "text-orange-400",
  },
  desperdicio: {
    label: "Desperdício",
    border: "border-l-amber-500",
    badgeBg: "bg-amber-500/15",
    badgeText: "text-amber-400",
  },
  oportunidade: {
    label: "Oportunidade",
    border: "border-l-sky-500",
    badgeBg: "bg-sky-500/15",
    badgeText: "text-sky-400",
  },
  risco: {
    label: "Risco",
    border: "border-l-fuchsia-500",
    badgeBg: "bg-fuchsia-500/15",
    badgeText: "text-fuchsia-400",
  },
  piora: {
    label: "Piora",
    border: "border-l-red-600",
    badgeBg: "bg-red-600/15",
    badgeText: "text-red-400",
  },
  positivo: {
    label: "Positivo",
    border: "border-l-emerald-500",
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-400",
  },
  alavanca: {
    label: "Alavanca",
    border: "border-l-teal-400",
    badgeBg: "bg-teal-400/15",
    badgeText: "text-teal-300",
  },
};

const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STREAM_KEYWORDS = [
  "netflix",
  "disney",
  "hbo",
  "prime",
  "spotify",
  "icloud",
  "youtube",
  "globoplay",
  "deezer",
  "apple tv",
  "paramount",
];

const FOOD_KEYWORDS = ["alimenta", "restaurante", "ifood", "delivery", "comida", "lanche"];
const TRANSPORT_KEYWORDS = ["transporte", "uber", "99", "posto", "combust", "gasolina"];
const RENT_KEYWORDS = ["aluguel", "condom", "luz", "água", "agua", "internet", "energia"];

function matches(label: string, keywords: string[]) {
  const l = label.toLowerCase();
  return keywords.some((k) => l.includes(k));
}

export function AlertsInsightsPanel() {
  const { cashflowMonths, selectedMonth, totalIncome, totalExpense, expectedBalance, banks, creditors } =
    useFinanceStore();

  const insights = useMemo<Insight[]>(() => {
    const out: Insight[] = [];
    const cur = cashflowMonths[selectedMonth];
    if (!cur) return out;

    // Window: até 3 últimos meses incluindo o selecionado
    const start = Math.max(0, selectedMonth - 2);
    const window = cashflowMonths.slice(start, selectedMonth + 1);

    const sumExp = (m: typeof cur) => m.expenses.reduce((s, e) => s + e.amount, 0);
    const sumInc = (m: typeof cur) => m.incomes.reduce((s, i) => s + i.amount, 0);

    // 1. Cartão estourado (limitUsed > limitTotal)
    const overBank = banks.find((b) => b.limitUsed > b.limitTotal);
    if (overBank) {
      const over = overBank.limitUsed - overBank.limitTotal;
      out.push({
        severity: "critico",
        title: `Limite estourado no ${overBank.name}`,
        description: (
          <>
            Você ultrapassou o limite em <strong>R$ {fmt(over)}</strong>. Isso aciona juros rotativos
            altíssimos. Priorize a quitação para evitar bola de neve.
          </>
        ),
      });
    }

    // 2. Saldo negativo no mês
    if (expectedBalance < 0) {
      out.push({
        severity: "critico",
        title: `Saldo negativo em ${cur.month}`,
        description: (
          <>
            Despesas superam receitas em <strong>R$ {fmt(Math.abs(expectedBalance))}</strong>. Sem ação,
            o rombo será coberto por cartão ou cheque especial.
          </>
        ),
      });
    }

    // 3. Alimentação fora supera aluguel
    const foodTotal = cur.expenses
      .filter((e) => matches(e.label, FOOD_KEYWORDS))
      .reduce((s, e) => s + e.amount, 0);
    const rentTotal = cur.expenses
      .filter((e) => matches(e.label, ["aluguel"]))
      .reduce((s, e) => s + e.amount, 0);
    if (foodTotal > 0 && rentTotal > 0 && foodTotal > rentTotal) {
      const pct = totalIncome > 0 ? ((foodTotal / totalIncome) * 100).toFixed(1) : "0";
      out.push({
        severity: "atencao",
        title: "Alimentação fora supera o aluguel",
        description: (
          <>
            Gasto com comida fora: <strong>R$ {fmt(foodTotal)}/mês</strong> ({pct}% da renda). Quase 1
            aluguel por mês só nisso.
          </>
        ),
      });
    }

    // 4. Transporte crescendo ao longo da janela
    if (window.length >= 2) {
      const first = window[0].expenses
        .filter((e) => matches(e.label, TRANSPORT_KEYWORDS))
        .reduce((s, e) => s + e.amount, 0);
      const last = window[window.length - 1].expenses
        .filter((e) => matches(e.label, TRANSPORT_KEYWORDS))
        .reduce((s, e) => s + e.amount, 0);
      if (first > 0 && last > first * 1.2) {
        const growth = (((last - first) / first) * 100).toFixed(0);
        out.push({
          severity: "atencao",
          title: `Transporte cresceu ${growth}% em ${window.length} meses`,
          description: (
            <>
              Passou de <strong>R$ {fmt(first)}</strong> em {window[0].month} para{" "}
              <strong>R$ {fmt(last)}</strong> em {window[window.length - 1].month}. Tendência de escalada.
            </>
          ),
        });
      }
    }

    // 5. Múltiplos streamings (assinaturas em cartões)
    const subs = new Map<string, number>();
    banks.forEach((b) =>
      b.installments.forEach((i) => {
        const name = i.description.toLowerCase();
        if (STREAM_KEYWORDS.some((k) => name.includes(k))) {
          subs.set(i.description, (subs.get(i.description) || 0) + i.installmentAmount);
        }
      }),
    );
    cur.expenses.forEach((e) => {
      if (matches(e.label, STREAM_KEYWORDS)) subs.set(e.label, (subs.get(e.label) || 0) + e.amount);
    });
    if (subs.size >= 3) {
      const total = Array.from(subs.values()).reduce((s, v) => s + v, 0);
      out.push({
        severity: "desperdicio",
        title: `${subs.size} streamings/assinaturas em paralelo`,
        description: (
          <>
            {Array.from(subs.keys()).slice(0, 6).join(" + ")} somam{" "}
            <strong>R$ {fmt(total)}/mês</strong>. Consolidando para 2-3 essenciais pode liberar{" "}
            <strong>R$ {fmt(total * 0.4)}/mês</strong>.
          </>
        ),
      });
    }

    // 6. Poupança consistente (oportunidade/positivo)
    const positiveMonths = window.filter((m) => sumInc(m) - sumExp(m) > 0).length;
    if (positiveMonths === window.length && window.length >= 2) {
      const avg = window.reduce((s, m) => s + (sumInc(m) - sumExp(m)), 0) / window.length;
      out.push({
        severity: "oportunidade",
        title: "Sobra recorrente — hora de aportar",
        description: (
          <>
            Você fechou todos os {window.length} últimos meses no azul, com média de{" "}
            <strong>R$ {fmt(avg)}/mês</strong>. Direcione para reserva ou quitação acelerada.
          </>
        ),
      });
    }

    // 7. Zero reserva + dívida
    const totalDebtBanks = banks.reduce((s, b) => s + b.limitUsed, 0);
    if (expectedBalance < 1000 && totalDebtBanks > 0) {
      out.push({
        severity: "risco",
        title: "Sem reserva · dependência de crédito",
        description: (
          <>
            Qualquer imprevisto recai sobre cartão. Custo típico de rotativo:{" "}
            <strong>~14% a.m.</strong> vs <strong>~0,9% a.m.</strong> em renda fixa ={" "}
            <strong>13x</strong> de diferença.
          </>
        ),
      });
    }

    // 8. Saldo piorando mês a mês
    if (window.length >= 3) {
      const balances = window.map((m) => sumInc(m) - sumExp(m));
      if (balances[0] > balances[1] && balances[1] > balances[2]) {
        out.push({
          severity: "piora",
          title: "Saldo deteriora mês a mês",
          description: (
            <>
              {window.map((m, i) => (
                <span key={i}>
                  {m.month}: R$ {fmt(balances[i])}
                  {i < window.length - 1 ? " · " : ""}
                </span>
              ))}
              . Tendência negativa precisa de correção.
            </>
          ),
        });
      }
    }

    // 9. Gastos fixos sob controle (positivo)
    const fixedTotal = cur.expenses
      .filter((e) => matches(e.label, RENT_KEYWORDS))
      .reduce((s, e) => s + e.amount, 0);
    if (totalIncome > 0) {
      const fixedPct = (fixedTotal / totalIncome) * 100;
      if (fixedPct > 0 && fixedPct <= 70) {
        out.push({
          severity: "positivo",
          title: "Gastos fixos sob controle relativo",
          description: (
            <>
              Aluguel + contas básicas representam <strong>{fixedPct.toFixed(1)}%</strong> da renda. O
              problema está no variável, não no estrutural.
            </>
          ),
        });
      }
    }

    // 10. Alavanca: cortar X% da variável zera déficit
    if (expectedBalance < 0) {
      const variable = totalExpense - fixedTotal;
      if (variable > 0) {
        const cutPct = (Math.abs(expectedBalance) / variable) * 100;
        if (cutPct <= 50) {
          out.push({
            severity: "alavanca",
            title: "Potencial de recuperação rápida",
            description: (
              <>
                Cortar apenas <strong>{cutPct.toFixed(0)}%</strong> dos gastos variáveis (R${" "}
                {fmt(variable)}) já zera o déficit do mês.
              </>
            ),
          });
        }
      }
    }

    // 11. Credor com dívida em aberto
    const openCreditor = creditors.find((c) => c.totalDebt - c.amountPaid > 0);
    if (openCreditor) {
      const rem = openCreditor.totalDebt - openCreditor.amountPaid;
      out.push({
        severity: "oportunidade",
        title: `Quitar ${openCreditor.name} libera fluxo`,
        description: (
          <>
            Faltam <strong>R$ {fmt(rem)}</strong>. Usar o método bola de neve elimina a parcela
            recorrente e liberta caixa para reserva.
          </>
        ),
      });
    }

    return out;
  }, [cashflowMonths, selectedMonth, totalIncome, totalExpense, expectedBalance, banks, creditors]);

  return (
    <section className="animate-float-in">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-xs font-mono text-primary tracking-widest">09</span>
        <h2 className="text-xs font-mono text-muted-foreground tracking-[0.25em] uppercase">
          Alertas e Insights
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent" />
        <span className="text-[10px] text-muted-foreground">{insights.length} sinais</span>
      </div>

      {insights.length === 0 ? (
        <div className="glass-card rounded-2xl p-6 text-sm text-muted-foreground text-center">
          Nenhum alerta relevante para este período. 🎯
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger-children">
          {insights.map((it, i) => {
            const s = SEVERITY_STYLES[it.severity];
            return (
              <div
                key={i}
                className={`glass-card rounded-2xl border-l-[3px] ${s.border} p-5 transition-all hover:scale-[1.01]`}
              >
                <div
                  className={`inline-flex items-center px-2 py-0.5 rounded ${s.badgeBg} ${s.badgeText} text-[10px] font-mono uppercase tracking-widest mb-3`}
                >
                  {s.label}
                </div>
                <h3 className="text-sm font-bold text-foreground mb-2 leading-snug">{it.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{it.description}</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
