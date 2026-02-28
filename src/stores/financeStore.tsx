import { useState, useCallback, createContext, useContext, type ReactNode } from "react";
import {
  banks as initialBanks,
  cashflowMonths as initialCashflow,
  creditors as initialCreditors,
  initialGoals,
  monthlySnapshots,
  type Bank,
  type BankId,
  type CashflowMonth,
  type Creditor,
  type Goal,
  type MonthlySnapshot,
} from "@/data/financialData";

export interface FinanceStore {
  banks: Bank[];
  cashflowMonths: CashflowMonth[];
  creditors: Creditor[];
  goals: Goal[];
  monthlySnapshots: MonthlySnapshot[];
  selectedMonth: number;
  selectedBank: Bank | null;
  currentCashflow: CashflowMonth;
  totalDebt: number;
  totalIncome: number;
  totalExpense: number;
  expectedBalance: number;
  totalCreditorsDebt: number;
  totalCreditorsPaid: number;
  savingsGoalMonth: number;
  allInstallments: any[];
  setSelectedMonth: (m: number) => void;
  setSelectedBank: (b: Bank | null) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  updateBankBalance: (bankId: BankId, newUsed: number) => void;
  toggleCashflowPaid: (monthIdx: number, type: "incomes" | "expenses", itemIdx: number) => void;
  depositToGoal: (goalId: string, amount: number) => void;
}

function useFinanceStoreInternal(): FinanceStore {
  const [banks, setBanks] = useState<Bank[]>(initialBanks);
  const [cashflowMonths, setCashflowMonths] = useState<CashflowMonth[]>(initialCashflow);
  const [creditors] = useState<Creditor[]>(initialCreditors);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);

  const currentCashflow = cashflowMonths[selectedMonth];

  const totalDebt = banks.reduce((sum, b) => sum + b.debtFinal, 0);
  const totalIncome = currentCashflow.incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpense = currentCashflow.expenses.reduce((s, e) => s + e.amount, 0);
  const expectedBalance = totalIncome - totalExpense;

  const totalCreditorsDebt = creditors.reduce((s, c) => s + c.totalDebt, 0);
  const totalCreditorsPaid = creditors.reduce((s, c) => s + c.amountPaid, 0);

  const savingsGoalMonth = 2000; // target savings per month

  const allInstallments = banks
    .flatMap((b) =>
      b.installments.map((inst) => ({ ...inst, bankId: b.id, bankName: b.name, bankColor: b.color }))
    )
    .filter((i) => i.status !== "pago")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const nextMonth = useCallback(() => {
    setSelectedMonth((m) => Math.min(m + 1, cashflowMonths.length - 1));
  }, [cashflowMonths.length]);

  const prevMonth = useCallback(() => {
    setSelectedMonth((m) => Math.max(m - 1, 0));
  }, []);

  const updateBankBalance = useCallback((bankId: BankId, newUsed: number) => {
    setBanks((prev) =>
      prev.map((b) =>
        b.id === bankId ? { ...b, limitUsed: newUsed, debtFinal: newUsed } : b
      )
    );
  }, []);

  const toggleCashflowPaid = useCallback(
    (monthIdx: number, type: "incomes" | "expenses", itemIdx: number) => {
      setCashflowMonths((prev) =>
        prev.map((m, mi) => {
          if (mi !== monthIdx) return m;
          const items = [...m[type]];
          items[itemIdx] = { ...items[itemIdx], paid: !items[itemIdx].paid };
          return { ...m, [type]: items };
        })
      );
    },
    []
  );

  const depositToGoal = useCallback((goalId: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, savedAmount: Math.min(g.savedAmount + amount, g.targetAmount) }
          : g
      )
    );
  }, []);

  return {
    banks,
    cashflowMonths,
    creditors,
    goals,
    monthlySnapshots,
    selectedMonth,
    selectedBank,
    currentCashflow,
    totalDebt,
    totalIncome,
    totalExpense,
    expectedBalance,
    totalCreditorsDebt,
    totalCreditorsPaid,
    savingsGoalMonth,
    allInstallments,
    setSelectedMonth,
    setSelectedBank,
    nextMonth,
    prevMonth,
    updateBankBalance,
    toggleCashflowPaid,
    depositToGoal,
  };
}

const FinanceContext = createContext<FinanceStore | null>(null as FinanceStore | null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const store = useFinanceStoreInternal();
  return <FinanceContext.Provider value={store}>{children}</FinanceContext.Provider>;
}

export function useFinanceStore(): FinanceStore {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinanceStore must be used within FinanceProvider");
  return ctx;
}
