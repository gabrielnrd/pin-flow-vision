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
import { BudgetRuleWidget } from "@/components/BudgetRuleWidget";
import { SnowballCalculator } from "@/components/SnowballCalculator";
import { BrainInsightsPanel } from "@/components/BrainInsightsPanel";
import { FinancialHealthScore } from "@/components/FinancialHealthScore";
import { CreditCard, BarChart3, Brain, Users, Activity } from "lucide-react";

function SectionTitle({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="w-4.5 h-4.5 text-primary" />
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

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8 max-w-[1600px] mx-auto space-y-10 pb-24 md:pb-6">
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

      {/* Hero Chart - Full width */}
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

      {/* Section: Cards */}
      <section>
        <SectionTitle icon={CreditCard} title="Cartões de Crédito" subtitle="Saldo usado é calculado automaticamente pelas parcelas" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 stagger-children">
          {store.banks.map((bank, i) => (
            <BankCard
              key={bank.id}
              bank={bank}
              index={i}
              onClick={() => store.setSelectedBank(bank)}
              onUpdateBank={store.updateBank}
            />
          ))}
          <AddBankCard onAdd={store.addBank} />
        </div>
      </section>

      {/* Section: Analytics - 2 column */}
      <section>
        <SectionTitle icon={BarChart3} title="Análises & Fluxo" subtitle="Acompanhe suas finanças em detalhe" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
          />
          <div className="space-y-5">
            <SpendingChart banks={store.banks} />
            <BudgetRuleWidget
              cashflow={store.currentCashflow}
              totalIncome={store.totalIncome}
            />
          </div>
        </div>
      </section>

      {/* Section: Timeline + Calendar - 2 column */}
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

      {/* Section: Health + Creditors + Brain */}
      <section>
        <SectionTitle icon={Users} title="Credores & Inteligência" subtitle="Dívidas pessoais e insights do Segundo Cérebro" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-5">
            <FinancialHealthScore />
            <CreditorWidget
              creditors={store.creditors}
              totalDebt={store.totalCreditorsDebt}
              totalPaid={store.totalCreditorsPaid}
              onAdd={store.addCreditor}
              onRemove={store.removeCreditor}
              onUpdate={store.updateCreditor}
            />
            <SnowballCalculator creditors={store.creditors} />
          </div>
          <BrainInsightsPanel />
        </div>
      </section>

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
