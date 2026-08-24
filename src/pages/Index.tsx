import { useFinanceStore } from "@/stores/financeStore";
import { DashboardHeader } from "@/components/DashboardHeader";
import { BankCard } from "@/components/BankCard";
import { AddBankCard } from "@/components/AddBankCard";
import { CashflowCard } from "@/components/CashflowCard";
import { InstallmentTimeline } from "@/components/InstallmentTimeline";
import { CreditorWidget } from "@/components/CreditorWidget";
import { SpendingChart } from "@/components/SpendingChart";
import { BankDetailSheet } from "@/components/BankDetailSheet";
import { ExpenseFAB } from "@/components/ExpenseFAB";
import { HeroChart } from "@/components/HeroChart";
import { CalendarCard } from "@/components/CalendarCard";
import { FinancialHealthScore } from "@/components/FinancialHealthScore";
import { IncomeCoverageAI } from "@/components/IncomeCoverageAI";
import { BudgetScenarios } from "@/components/BudgetScenarios";
import { AnnualSubscriptionsCard } from "@/components/AnnualSubscriptionsCard";
import { BalanceProjectionChart } from "@/components/BalanceProjectionChart";
import { CashflowSankey } from "@/components/CashflowSankey";
import { EyeOff, Eye } from "lucide-react";
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

          {/* 03 — Fluxo do mês */}
          <section key={`cf-${store.selectedMonth}`} className="animate-float-in">
            <SectionHead
              index="03"
              title="Fluxo do Mês"
              subtitle="Receitas, despesas e cartão do período selecionado"
            />
            <CashflowCard
              cashflow={store.currentCashflow}
              totalIncome={store.totalIncome}
              totalExpense={store.totalExpense}
              cardExpensesForMonth={store.cardExpensesForMonth}
              expectedBalance={store.expectedBalance}
              onPrev={store.prevMonth}
              onNext={store.nextMonth}
              canPrev={store.selectedMonth > 0}
              canNext={store.selectedMonth < store.cashflowMonths.length - 1}
              monthIndex={store.selectedMonth}
              onTogglePaid={store.toggleCashflowPaid}
              onAddItem={store.addCashflowItem}
              onRemoveItem={store.removeCashflowItem}
              onUpdateItem={store.updateCashflowItem}
              onSetFixed={store.setCashflowItemFixed}
              onReplicateFixed={store.replicateFixedItem}
            />
          </section>

          {/* 04 — Cartões */}
          <section>
            <SectionHead
              index="04"
              title="Cartões de Crédito"
              subtitle="Saldo usado calculado automaticamente pelas parcelas"
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
                <BankCard
                  key={bank.id}
                  bank={bank}
                  index={i}
                  onClick={() => store.setSelectedBank(bank)}
                  onUpdateBank={store.updateBank}
                />
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
            <SectionHead index="07" title="Análise & Visualização" subtitle="Projeções, comparativos e fluxos" />
            <div className="grid grid-cols-1 gap-4">
              <BalanceProjectionChart />
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <MonthCategoryHeatmap />
                <CashflowSankey />
              </div>
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
            <BudgetScenarios />
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
