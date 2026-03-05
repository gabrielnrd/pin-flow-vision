import { useFinanceStore } from "@/stores/financeStore";
import { DashboardHeader } from "@/components/DashboardHeader";
import { BankCard } from "@/components/BankCard";
import { CashflowCard } from "@/components/CashflowCard";
import { InstallmentTimeline } from "@/components/InstallmentTimeline";
import { CreditorWidget } from "@/components/CreditorWidget";
import { SpendingChart } from "@/components/SpendingChart";
import { BankDetailSheet } from "@/components/BankDetailSheet";
import { ExpenseFAB } from "@/components/ExpenseFAB";
import { HeroChart } from "@/components/HeroChart";
import { CalendarCard } from "@/components/CalendarCard";

const Index = () => {
  const store = useFinanceStore();

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
      <DashboardHeader
        totalDebt={store.totalDebt}
        expectedBalance={store.expectedBalance}
        monthLabel={`${store.currentCashflow.month} ${store.currentCashflow.year}`}
        selectedMonth={store.selectedMonth}
        totalMonths={store.cashflowMonths.length}
        onMonthChange={store.setSelectedMonth}
        cashflowMonths={store.cashflowMonths}
      />

      <HeroChart
        cashflowMonths={store.cashflowMonths}
        totalDebt={store.totalDebt}
        expectedBalance={store.expectedBalance}
        savingsGoalMonth={store.savingsGoalMonth}
        onSavingsGoalChange={store.setSavingsGoalMonth}
      />

      <div className="masonry-grid">
        {store.banks.map((bank, i) => (
          <BankCard
            key={bank.id}
            bank={bank}
            index={i}
            onClick={() => store.setSelectedBank(bank)}
            onUpdateBalance={store.updateBankBalance}
            onUpdateBank={store.updateBank}
          />
        ))}

        <SpendingChart banks={store.banks} />

        <CashflowCard
          cashflow={store.currentCashflow}
          totalIncome={store.totalIncome}
          totalExpense={store.totalExpense}
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

        <CalendarCard installments={store.allInstallments} />

        <InstallmentTimeline
          installments={store.allInstallments}
          onUpdate={store.updateInstallment}
          onRemove={store.removeInstallment}
          onAdd={store.addInstallment}
          banks={store.banks.map((b) => ({ id: b.id, name: b.name }))}
        />

        <CreditorWidget
          creditors={store.creditors}
          totalDebt={store.totalCreditorsDebt}
          totalPaid={store.totalCreditorsPaid}
          onAdd={store.addCreditor}
          onRemove={store.removeCreditor}
          onUpdate={store.updateCreditor}
        />
      </div>

      <BankDetailSheet
        bank={store.selectedBank}
        open={!!store.selectedBank}
        onOpenChange={(open) => { if (!open) store.setSelectedBank(null); }}
        onUpdateInstallment={store.updateInstallment}
        onRemoveInstallment={store.removeInstallment}
        onAddInstallment={store.addInstallment}
      />

      <ExpenseFAB />
    </div>
  );
};

export default Index;
