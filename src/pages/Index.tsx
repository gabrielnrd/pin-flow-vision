import { useFinanceStore } from "@/stores/financeStore";
import { DashboardHeader } from "@/components/DashboardHeader";
import { BankCard } from "@/components/BankCard";
import { AddBankCard } from "@/components/AddBankCard";
import { InstallmentTimeline } from "@/components/InstallmentTimeline";
import { CreditorWidget } from "@/components/CreditorWidget";
import { SpendingChart } from "@/components/SpendingChart";
import { BankDetailSheet } from "@/components/BankDetailSheet";
import { ExpenseFAB } from "@/components/ExpenseFAB";
import { HeroChart } from "@/components/HeroChart";
import { CalendarCard } from "@/components/CalendarCard";
import { FinancialHealthScore } from "@/components/FinancialHealthScore";
import { IncomeCoverageAI } from "@/components/IncomeCoverageAI";
import { AnnualSubscriptionsCard } from "@/components/AnnualSubscriptionsCard";
import { BalanceProjectionChart } from "@/components/BalanceProjectionChart";
import { CashflowSankey } from "@/components/CashflowSankey";
import { EyeOff, Eye, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

/** Editorial section head: numbered mono label + hairline rule */
function SectionHead({
  index,
  title,
  subtitle,
  action,
}: {
  index: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-baseline gap-3 min-w-0">
          <span className="label-mono shrink-0">{index}</span>
          <div className="min-w-0">
            <h2 className="font-display text-base sm:text-lg font-semibold tracking-tight text-foreground truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5 font-normal">{subtitle}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      <div className="hairline mt-4" />
    </div>
  );
}

const Index = () => {
  const store = useFinanceStore();
  const [showCancelled, setShowCancelled] = useState(false);
  const [dragBankId, setDragBankId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const activeBanks = store.banks.filter((b) => b.status !== "cancelado");
  const cancelledBanks = store.banks.filter((b) => b.status === "cancelado");

  return (
    <div className="relative min-h-screen bg-background">
      {/* Faint paper grid, no glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
          maskImage: "radial-gradient(ellipse at 50% 0%, black 0%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, black 0%, transparent 75%)",
        }}
      />

      <div className="px-4 py-8 sm:px-8 lg:px-12 max-w-[1440px] mx-auto pb-28 md:pb-16">
        <DashboardHeader
          totalDebt={store.totalDebt}
          expectedBalance={store.expectedBalance}
          monthLabel={`${store.currentCashflow.month} ${store.currentCashflow.year}`}
          selectedMonth={store.selectedMonth}
          totalMonths={store.cashflowMonths.length}
          onMonthChange={store.setSelectedMonth}
          cashflowMonths={store.cashflowMonths}
        />

        <div className="space-y-14">
          {/* 01 — Panorama (hero bento) */}
          <section>
            <SectionHead index="01" title="Panorama" subtitle="Dívida, saldo e meta do período" />
            <HeroChart
              cashflowMonths={store.cashflowMonths}
              totalDebt={store.totalDebt}
              totalExpense={store.totalExpense}
              expectedBalance={store.expectedBalance}
              savingsGoalMonth={store.savingsGoalMonth}
              onSavingsGoalChange={store.setSavingsGoalMonth}
              selectedMonth={store.selectedMonth}
              banks={store.banks}
              creditors={store.creditors}
              cardExpensesForMonth={store.cardExpensesForMonth}
            />
          </section>

          {/* 02 — Cobertura de renda + saúde + distribuição (bento) */}
          <section>
            <SectionHead index="02" title="Cobertura & Saúde" subtitle="A renda cobre os próximos meses?" />
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 auto-rows-min">
              <div className="lg:col-span-4">
                <IncomeCoverageAI />
              </div>
              <div className="lg:col-span-2">
                <FinancialHealthScore />
              </div>
              <div className="lg:col-span-6">
                <SpendingChart banks={store.banks} />
              </div>
            </div>
          </section>

          {/* 03 — Atalho para o fluxo do mês */}
          <section>
            <SectionHead
              index="03"
              title="Fluxo do Mês"
              subtitle="Entradas e saídas detalhadas em seção própria"
              action={
                <Link
                  to="/fluxo"
                  className="flex items-center gap-1.5 text-[11px] label-mono hover:text-foreground transition-colors border border-border rounded-md px-2.5 py-1.5"
                >
                  Abrir fluxo <ArrowRight className="w-3 h-3" />
                </Link>
              }
            />
            <Link
              to="/fluxo"
              className="block rounded-2xl border border-border bg-card p-5 hover:border-foreground/30 transition-colors"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="label-mono">Receitas</p>
                  <p className="text-money text-lg text-income">R$ {store.totalIncome.toLocaleString("pt-BR")}</p>
                </div>
                <div>
                  <p className="label-mono">Despesas</p>
                  <p className="text-money text-lg text-expense">R$ {store.totalExpense.toLocaleString("pt-BR")}</p>
                </div>
                <div>
                  <p className="label-mono">Cartão</p>
                  <p className="text-money text-lg text-expense">R$ {store.cardExpensesForMonth.toLocaleString("pt-BR")}</p>
                </div>
                <div>
                  <p className="label-mono">Saldo final</p>
                  <p className={`text-money text-lg ${store.expectedBalance < 0 ? "text-expense" : "text-income"}`}>
                    R$ {store.expectedBalance.toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            </Link>
          </section>


          {/* 04 — Cartões */}
          <section>
            <SectionHead
              index="04"
              title="Cartões de Crédito"
              subtitle="Saldo usado calculado automaticamente pelas parcelas • arraste para reordenar"
              action={
                cancelledBanks.length > 0 ? (
                  <button
                    onClick={() => setShowCancelled((s) => !s)}
                    className="flex items-center gap-1.5 text-[11px] label-mono hover:text-foreground transition-colors border border-border rounded-md px-2.5 py-1.5"
                  >
                    {showCancelled ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showCancelled ? "Ocultar cancelados" : `Cancelados (${cancelledBanks.length})`}
                  </button>
                ) : undefined
              }
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
              {activeBanks.map((bank, i) => (
                <div
                  key={bank.id}
                  draggable
                  onDragStart={() => setDragBankId(bank.id)}
                  onDragEnd={() => { setDragBankId(null); setDragOverId(null); }}
                  onDragOver={(e) => { e.preventDefault(); if (dragBankId && dragBankId !== bank.id) setDragOverId(bank.id); }}
                  onDragLeave={() => setDragOverId((cur) => (cur === bank.id ? null : cur))}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragBankId && dragBankId !== bank.id) store.moveBank(dragBankId, bank.id);
                    setDragBankId(null); setDragOverId(null);
                  }}
                  className={`transition-all duration-200 ${
                    dragBankId === bank.id ? "opacity-40 scale-[0.97]" : ""
                  } ${dragOverId === bank.id ? "ring-2 ring-primary/60 ring-offset-2 ring-offset-background rounded-3xl" : ""}`}
                >
                  <BankCard
                    bank={bank}
                    index={i}
                    onClick={() => store.setSelectedBank(bank)}
                    onUpdateBank={store.updateBank}
                  />
                </div>
              ))}
              {showCancelled &&
                cancelledBanks.map((bank, i) => (
                  <BankCard
                    key={bank.id}
                    bank={bank}
                    index={activeBanks.length + i}
                    onClick={() => store.setSelectedBank(bank)}
                    onUpdateBank={store.updateBank}
                  />
                ))}
              <AddBankCard onAdd={store.addBank} />
            </div>
          </section>

          {/* 05 — Vencimentos */}
          <section>
            <SectionHead index="05" title="Vencimentos" subtitle="Parcelas e calendário" />
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
              <InstallmentTimeline
                installments={store.allInstallments}
                onUpdate={store.updateInstallment}
                onRemove={store.removeInstallment}
                onAdd={store.addInstallment}
                banks={store.banks.map((b) => ({ id: b.id, name: b.name }))}
              />
              <CalendarCard installments={store.allInstallments} />
            </div>
          </section>

          {/* 06 — Assinaturas */}
          <section>
            <SectionHead index="06" title="Assinaturas & Serviços" subtitle="Custo anual recorrente" />
            <AnnualSubscriptionsCard />
          </section>

          {/* 07 — Análise */}
          <section>
            <SectionHead index="07" title="Análise & Visualização" subtitle="Projeções e fluxo de caixa" />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <BalanceProjectionChart />
              <CashflowSankey />
            </div>
          </section>

          {/* 08 — Credores */}
          <section>
            <SectionHead index="08" title="Credores" subtitle="Dívidas pessoais" />
            <CreditorWidget
              creditors={store.creditors}
              totalDebt={store.totalCreditorsDebt}
              totalPaid={store.totalCreditorsPaid}
              onAdd={store.addCreditor}
              onRemove={store.removeCreditor}
              onUpdate={store.updateCreditor}
            />
          </section>

          {/* 09 — Cenários */}
          <section>
            <SectionHead index="09" title="Cenários de Orçamento" subtitle="Simule e compare a cobertura" />
          </section>
        </div>
      </div>

      <BankDetailSheet
        bank={store.selectedBank}
        open={!!store.selectedBank}
        onOpenChange={(open) => {
          if (!open) store.setSelectedBank(null);
        }}
        onUpdateInstallment={store.updateInstallment}
        onRemoveInstallment={store.removeInstallment}
        onAddInstallment={store.addInstallment}
        onUpdateBank={store.updateBank}
        onRemoveBank={store.removeBank}
      />

      <ExpenseFAB />
    </div>
  );
};

export default Index;
