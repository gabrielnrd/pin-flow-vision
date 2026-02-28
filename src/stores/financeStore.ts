import { useState, useCallback } from "react";
import { banks, cashflowMonths, creditors, type Bank, type CashflowMonth, type Creditor } from "@/data/financialData";

export function useFinanceStore() {
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);

  const currentCashflow = cashflowMonths[selectedMonth];

  const totalDebt = banks.reduce((sum, b) => sum + b.debtFinal, 0);

  const totalIncome = currentCashflow.incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpense = currentCashflow.expenses.reduce((s, e) => s + e.amount, 0);
  const expectedBalance = totalIncome - totalExpense;

  const totalCreditorsDebt = creditors.reduce((s, c) => s + c.totalDebt, 0);
  const totalCreditorsPaid = creditors.reduce((s, c) => s + c.amountPaid, 0);

  const allInstallments = banks
    .flatMap((b) =>
      b.installments.map((inst) => ({ ...inst, bankId: b.id, bankName: b.name, bankColor: b.color }))
    )
    .filter((i) => i.status !== "pago")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const nextMonth = useCallback(() => {
    setSelectedMonth((m) => Math.min(m + 1, cashflowMonths.length - 1));
  }, []);

  const prevMonth = useCallback(() => {
    setSelectedMonth((m) => Math.max(m - 1, 0));
  }, []);

  return {
    banks,
    cashflowMonths,
    creditors,
    selectedMonth,
    setSelectedMonth,
    currentCashflow,
    totalDebt,
    totalIncome,
    totalExpense,
    expectedBalance,
    totalCreditorsDebt,
    totalCreditorsPaid,
    allInstallments,
    selectedBank,
    setSelectedBank,
    nextMonth,
    prevMonth,
  };
}
