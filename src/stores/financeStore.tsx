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
  // CRUD - Cashflow
  addCashflowItem: (monthIdx: number, type: "incomes" | "expenses", label: string, amount: number) => void;
  removeCashflowItem: (monthIdx: number, type: "incomes" | "expenses", itemIdx: number) => void;
  updateCashflowItem: (monthIdx: number, type: "incomes" | "expenses", itemIdx: number, label: string, amount: number) => void;
  // CRUD - Creditors
  addCreditor: (name: string, totalDebt: number) => void;
  removeCreditor: (id: string) => void;
  updateCreditor: (id: string, updates: Partial<Pick<Creditor, "name" | "totalDebt" | "amountPaid">>) => void;
  // CRUD - Goals
  addGoal: (title: string, targetAmount: number) => void;
  removeGoal: (id: string) => void;
  updateGoal: (id: string, updates: Partial<Pick<Goal, "title" | "targetAmount" | "image">>) => void;
  // CRUD - Banks
  updateBank: (bankId: BankId, updates: Partial<Pick<Bank, "name" | "limitTotal" | "status">>) => void;
  addInstallment: (bankId: BankId, inst: Omit<import("@/data/financialData").Installment, "id">) => void;
  removeInstallment: (bankId: BankId, installmentId: string) => void;
  updateInstallment: (bankId: BankId, installmentId: string, updates: Partial<Omit<import("@/data/financialData").Installment, "id">>) => void;
  // Savings goal
  setSavingsGoalMonth: (v: number) => void;
}

function useFinanceStoreInternal(): FinanceStore {
  const [banks, setBanks] = useState<Bank[]>(initialBanks);
  const [cashflowMonths, setCashflowMonths] = useState<CashflowMonth[]>(initialCashflow);
  const [creditors, setCreditors] = useState<Creditor[]>(initialCreditors);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [savingsGoalMonth, setSavingsGoalMonth] = useState(2000);

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

  // CRUD - Cashflow
  const addCashflowItem = useCallback((monthIdx: number, type: "incomes" | "expenses", label: string, amount: number) => {
    setCashflowMonths((prev) =>
      prev.map((m, mi) => {
        if (mi !== monthIdx) return m;
        return { ...m, [type]: [...m[type], { label, amount, paid: false }] };
      })
    );
  }, []);

  const removeCashflowItem = useCallback((monthIdx: number, type: "incomes" | "expenses", itemIdx: number) => {
    setCashflowMonths((prev) =>
      prev.map((m, mi) => {
        if (mi !== monthIdx) return m;
        const items = m[type].filter((_, i) => i !== itemIdx);
        return { ...m, [type]: items };
      })
    );
  }, []);

  const updateCashflowItem = useCallback((monthIdx: number, type: "incomes" | "expenses", itemIdx: number, label: string, amount: number) => {
    setCashflowMonths((prev) =>
      prev.map((m, mi) => {
        if (mi !== monthIdx) return m;
        const items = [...m[type]];
        items[itemIdx] = { ...items[itemIdx], label, amount };
        return { ...m, [type]: items };
      })
    );
  }, []);

  // CRUD - Creditors
  const addCreditor = useCallback((name: string, totalDebt: number) => {
    setCreditors((prev) => [...prev, { id: `cr-${Date.now()}`, name, totalDebt, amountPaid: 0 }]);
  }, []);

  const removeCreditor = useCallback((id: string) => {
    setCreditors((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateCreditor = useCallback((id: string, updates: Partial<Pick<Creditor, "name" | "totalDebt" | "amountPaid">>) => {
    setCreditors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  // CRUD - Goals
  const addGoal = useCallback((title: string, targetAmount: number) => {
    const colors = ["265 80% 50%", "145 63% 42%", "45 100% 50%", "27 100% 50%", "200 80% 50%"];
    const emojis = ["🎯", "💰", "🌟", "🏆", "🚀"];
    const idx = goals.length % colors.length;
    setGoals((prev) => [
      ...prev,
      { id: `g-${Date.now()}`, title, targetAmount, savedAmount: 0, image: emojis[idx], color: colors[idx] },
    ]);
  }, [goals.length]);

  const removeGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<Pick<Goal, "title" | "targetAmount" | "image">>) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
  }, []);

  // CRUD - Banks
  const updateBank = useCallback((bankId: BankId, updates: Partial<Pick<Bank, "name" | "limitTotal" | "status">>) => {
    setBanks((prev) => prev.map((b) => (b.id === bankId ? { ...b, ...updates } : b)));
  }, []);

  const addInstallment = useCallback((bankId: BankId, inst: Omit<import("@/data/financialData").Installment, "id">) => {
    setBanks((prev) => prev.map((b) => {
      if (b.id !== bankId) return b;
      const newInst = { ...inst, id: `${bankId}-${Date.now()}` };
      return { ...b, installments: [...b.installments, newInst] };
    }));
  }, []);

  const removeInstallment = useCallback((bankId: BankId, installmentId: string) => {
    setBanks((prev) => prev.map((b) => {
      if (b.id !== bankId) return b;
      return { ...b, installments: b.installments.filter((i) => i.id !== installmentId) };
    }));
  }, []);

  const updateInstallment = useCallback((bankId: BankId, installmentId: string, updates: Partial<Omit<import("@/data/financialData").Installment, "id">>) => {
    setBanks((prev) => prev.map((b) => {
      if (b.id !== bankId) return b;
      return { ...b, installments: b.installments.map((i) => (i.id === installmentId ? { ...i, ...updates } : i)) };
    }));
  }, []);

  return {
    banks, cashflowMonths, creditors, goals, monthlySnapshots,
    selectedMonth, selectedBank, currentCashflow,
    totalDebt, totalIncome, totalExpense, expectedBalance,
    totalCreditorsDebt, totalCreditorsPaid, savingsGoalMonth,
    allInstallments,
    setSelectedMonth, setSelectedBank, nextMonth, prevMonth,
    updateBankBalance, toggleCashflowPaid, depositToGoal,
    addCashflowItem, removeCashflowItem, updateCashflowItem,
    addCreditor, removeCreditor, updateCreditor,
    addGoal, removeGoal, updateGoal,
    updateBank, addInstallment, removeInstallment, updateInstallment,
    setSavingsGoalMonth,
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
