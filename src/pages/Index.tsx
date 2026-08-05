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
import { FinancialHealthDashboard } from "@/components/FinancialHealthDashboard";
import { BalanceProjectionChart } from "@/components/BalanceProjectionChart";
import { MonthCategoryHeatmap } from "@/components/MonthCategoryHeatmap";
import { CashflowSankey } from "@/components/CashflowSankey";
import { CreditCard, BarChart3, Users, PieChart, EyeOff, Eye } from "lucide-react";
import { useState } from "react";

function SectionTitle({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary/25 to-primary/5 flex items-center justify-center ring-1 ring-primary/20 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.5)]">
        <Icon className="w-4.5 h-4.5 text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.7)]" />
        <span className="absolute inset-0 rounded-xl bg-primary/10 blur-md -z-10" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-foreground tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

const Index = () => {
  const store = useFinanceStore();
  const [showCancelled, setShowCancelled] = useState(false);

  const activeBanks = store.banks.filter((b) => b.status !== "cancelado");
  const cancelledBanks = store.banks.filter((b) => b.status === "cancelado");

  return (
    <div className="relative min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8 max-w-[1600px] mx-auto space-y-10 pb-24 md:pb-6 overflow-hidden">
      {/* Ambient glow orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-primary/20 blur-[120px] opacity-60 animate-pulse [animation-duration:8s]" />
        <div className="absolute top-1/3 -right-40 w-[560px] h-[560px] rounded-full bg-accent/20 blur-[140px] opacity-50 animate-pulse [animation-duration:11s]" />
        <div className="absolute bottom-0 left-1/3 w-[480px] h-[480px] rounded-full bg-primary/15 blur-[120px] opacity-40 animate-pulse [animation-duration:14s]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,transparent_0%,hsl(var(--background))_70%)]" />
      </div>

      {/* Header */}
      <DashboardHeader
        totalDebt={store.totalDebt}
        expectedBalance={store.expectedBalance}
        monthLabel={`${store.currentCashflow.month} ${store.currentCashflow.year}`}
        selectedMonth={store.selectedMonth}
        totalMonths={store.cashflowMonths.length}
        onMonthChange={store.setSelectedMonth}
        cashflowMonths={store.cashflowMonths}
      />

      {/* 1. Hero: KPIs + chart (most important) */}
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

      {/* 2. AI Income Coverage — will your income cover the next months? */}
      <IncomeCoverageAI />

      {/* 4. Financial Health + Spending distribution */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <FinancialHealthScore />
          <SpendingChart banks={store.banks} />
        </div>
      </section>

      {/* 5. Cashflow of the selected month (re-animates on change) */}
      <section key={`cf-${store.selectedMonth}`} className="animate-float-in">
        <SectionTitle icon={BarChart3} title="Fluxo do Mês" subtitle="Receitas, despesas e cartão do período selecionado" />
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

      {/* 6. Cards */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <SectionTitle icon={CreditCard} title="Cartões de Crédito" subtitle="Saldo usado é calculado automaticamente pelas parcelas" />
          {cancelledBanks.length > 0 && (
            <button
              onClick={() => setShowCancelled((s) => !s)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary"
            >
              {showCancelled ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showCancelled ? "Ocultar cancelados" : `Mostrar cancelados (${cancelledBanks.length})`}
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 stagger-children">
          {activeBanks.map((bank, i) => (
            <BankCard
              key={bank.id}
              bank={bank}
              index={i}
              onClick={() => store.setSelectedBank(bank)}
              onUpdateBank={store.updateBank}
            />
          ))}
          {showCancelled && cancelledBanks.map((bank, i) => (
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

      {/* 7. Timeline + Calendar */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
          <InstallmentTimeline
            installments={store.allInstallments}
            onUpdate={store.updateInstallment}
            onRemove={store.removeInstallment}
            onAdd={store.addInstallment}
            banks={store.banks.map((b) => ({ id: b.id, name: b.name }))}
          />
          <div className="space-y-5">
            <CalendarCard installments={store.allInstallments} />
          </div>
        </div>
      </section>

      {/* 8. Deeper analytics */}
      <section>
        <SectionTitle icon={PieChart} title="Análise & Visualização" subtitle="Score, projeções, comparativos e fluxos" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <FinancialHealthDashboard />
          <BalanceProjectionChart />
        </div>
        <div className="space-y-5">
          <MonthCategoryHeatmap />
          <CashflowSankey />
        </div>
      </section>

      {/* 9. Annual subscriptions */}
      <AnnualSubscriptionsCard />

      {/* 10. Creditors */}
      <section>
        <SectionTitle icon={Users} title="Credores" subtitle="Dívidas pessoais" />
        <CreditorWidget
          creditors={store.creditors}
          totalDebt={store.totalCreditorsDebt}
          totalPaid={store.totalCreditorsPaid}
          onAdd={store.addCreditor}
          onRemove={store.removeCreditor}
          onUpdate={store.updateCreditor}
        />
      </section>

      {/* 11. Budget scenarios (planning at the end) */}
      <BudgetScenarios />





      {/* Bank Detail Sheet */}
      <BankDetailSheet
        bank={store.selectedBank}
        open={!!store.selectedBank}
        onOpenChange={(open) => { if (!open) store.setSelectedBank(null); }}
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
