import { useFinanceStore } from "@/stores/financeStore";
import { DashboardHeader } from "@/components/DashboardHeader";
import { BankCard } from "@/components/BankCard";
import { CashflowCard } from "@/components/CashflowCard";
import { InstallmentTimeline } from "@/components/InstallmentTimeline";
import { CreditorWidget } from "@/components/CreditorWidget";
import { SpendingChart } from "@/components/SpendingChart";
import { BankDetailSheet } from "@/components/BankDetailSheet";
import { ExpenseFAB } from "@/components/ExpenseFAB";

const Index = () => {
  const store = useFinanceStore();

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
      <DashboardHeader
        totalDebt={store.totalDebt}
        expectedBalance={store.expectedBalance}
        monthLabel={`${store.currentCashflow.month} ${store.currentCashflow.year}`}
      />

      <div className="masonry-grid">
        {/* Bank Cards */}
        {store.banks.map((bank, i) => (
          <BankCard
            key={bank.id}
            bank={bank}
            index={i}
            onClick={() => store.setSelectedBank(bank)}
          />
        ))}

        {/* Spending Chart */}
        <SpendingChart banks={store.banks} />

        {/* Cashflow */}
        <CashflowCard
          cashflow={store.currentCashflow}
          totalIncome={store.totalIncome}
          totalExpense={store.totalExpense}
          expectedBalance={store.expectedBalance}
          onPrev={store.prevMonth}
          onNext={store.nextMonth}
          canPrev={store.selectedMonth > 0}
          canNext={store.selectedMonth < store.cashflowMonths.length - 1}
        />

        {/* Timeline */}
        <InstallmentTimeline installments={store.allInstallments} />

        {/* Creditors */}
        <CreditorWidget
          creditors={store.creditors}
          totalDebt={store.totalCreditorsDebt}
          totalPaid={store.totalCreditorsPaid}
        />
      </div>

      {/* Bank Detail Sheet */}
      <BankDetailSheet
        bank={store.selectedBank}
        open={!!store.selectedBank}
        onOpenChange={(open) => {
          if (!open) store.setSelectedBank(null);
        }}
      />

      {/* FAB */}
      <ExpenseFAB />
    </div>
  );
};

export default Index;
