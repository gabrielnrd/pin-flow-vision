import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";
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

export interface IncomeSource {
  id: string;
  label: string;
  amount: number;
}

export interface FinanceStore {
  banks: Bank[];
  cashflowMonths: CashflowMonth[];
  creditors: Creditor[];
  goals: Goal[];
  monthlySnapshots: MonthlySnapshot[];
  incomeSources: IncomeSource[];
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
  addBank: (name: string, limitTotal: number, color: string, glowClass: string) => void;
  addInstallment: (bankId: BankId, inst: Omit<import("@/data/financialData").Installment, "id">) => void;
  removeInstallment: (bankId: BankId, installmentId: string) => void;
  updateInstallment: (bankId: BankId, installmentId: string, updates: Partial<Omit<import("@/data/financialData").Installment, "id">>) => void;
  // Savings goal
  setSavingsGoalMonth: (v: number) => void;
  // Brain settings
  salary: number;
  monthlyHours: number;
  hourlyRate: number;
  safetyMargin: number;
  dailySavings: number;
  phantomBalance: number;
  survivalDays: number;
  setSalary: (v: number) => void;
  setMonthlyHours: (v: number) => void;
  setSafetyMargin: (v: number) => void;
  // CRUD - Income Sources
  addIncomeSource: (label: string, amount: number) => void;
  removeIncomeSource: (id: string) => void;
  updateIncomeSource: (id: string, updates: Partial<Pick<IncomeSource, "label" | "amount">>) => void;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function loadCashflowFromStorage(key: string, fallback: CashflowMonth[]): CashflowMonth[] {
  const stored = loadFromStorage<CashflowMonth[]>(key, fallback);
  // Merge: keep stored data for existing months, add any new months from fallback
  const storedKeys = new Set(stored.map((m) => `${m.month}-${m.year}`));
  const newMonths = fallback.filter((m) => !storedKeys.has(`${m.month}-${m.year}`));
  return newMonths.length > 0 ? [...stored, ...newMonths] : stored;
}

function usePersistedCashflow(key: string, fallback: CashflowMonth[]): [CashflowMonth[], React.Dispatch<React.SetStateAction<CashflowMonth[]>>] {
  const [value, setValue] = useState<CashflowMonth[]>(() => loadCashflowFromStorage(key, fallback));
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

function usePersisted<T>(key: string, fallback: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => loadFromStorage(key, fallback));
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

function useFinanceStoreInternal(): FinanceStore {
  const [banksRaw, setBanks] = usePersisted<Bank[]>("fin_banks", initialBanks);
  const [cashflowMonths, setCashflowMonths] = usePersistedCashflow("fin_cashflow", initialCashflow);
  const [creditors, setCreditors] = usePersisted<Creditor[]>("fin_creditors", initialCreditors);
  const [goals, setGoals] = usePersisted<Goal[]>("fin_goals", initialGoals);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedBankId, setSelectedBankId] = useState<BankId | null>(null);
  const [incomeSources, setIncomeSources] = usePersisted<IncomeSource[]>("fin_incomeSources", [
    { id: "inc-1", label: "Salário", amount: 8500 },
    { id: "inc-2", label: "Freelance", amount: 2000 },
  ]);
  const [savingsGoalMonth, setSavingsGoalMonth] = usePersisted("fin_savingsGoal", 2000);
  const [salary, setSalary] = usePersisted("fin_salary", 1900);
  const [monthlyHours, setMonthlyHours] = usePersisted("fin_monthlyHours", 220);
  const [safetyMargin, setSafetyMargin] = usePersisted("fin_safetyMargin", 300);

  // Derive limitUsed and debtFinal from installments
  const banks = banksRaw.map((b) => {
    const usedFromInstallments = b.installments
      .filter((inst) => inst.status !== "pago")
      .reduce((sum, inst) => sum + inst.installmentAmount, 0);
    return { ...b, limitUsed: usedFromInstallments, debtFinal: usedFromInstallments };
  });

  // Always derive selectedBank from the latest banks state
  const selectedBank = selectedBankId ? banks.find((b) => b.id === selectedBankId) ?? null : null;
  const setSelectedBank = useCallback((b: Bank | null) => setSelectedBankId(b?.id ?? null), []);

  const currentCashflow = cashflowMonths[selectedMonth];
  const hourlyRate = monthlyHours > 0 ? salary / monthlyHours : 0;
  const dailySavings = savingsGoalMonth > 0 ? savingsGoalMonth / 30 : 0;

  const totalBankDebt = banks.reduce((sum, b) => sum + b.limitUsed, 0);
  const totalCreditorsDebt = creditors.reduce((s, c) => s + c.totalDebt, 0);
  const totalCreditorsPaid = creditors.reduce((s, c) => s + c.amountPaid, 0);
  const totalCreditorsRemaining = totalCreditorsDebt - totalCreditorsPaid;
  const totalDebt = totalBankDebt + totalCreditorsRemaining;
  const totalIncome = currentCashflow.incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpense = currentCashflow.expenses.reduce((s, e) => s + e.amount, 0);
  const expectedBalance = totalIncome - totalExpense;
  const phantomBalance = expectedBalance - safetyMargin;
  const avgDailyExpense = totalExpense / 30;
  const survivalDays = avgDailyExpense > 0 ? Math.floor(expectedBalance / avgDailyExpense) : 0;

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

  // updateBankBalance is now a no-op since limitUsed is derived from installments
  const updateBankBalance = useCallback((_bankId: BankId, _newUsed: number) => {
    // limitUsed is now auto-calculated from installments
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

  const addBank = useCallback((name: string, limitTotal: number, color: string, glowClass: string) => {
    const id = `bank-${Date.now()}` as BankId;
    setBanks((prev) => [...prev, {
      id,
      name,
      color,
      glowClass,
      limitTotal,
      limitUsed: 0,
      debtFinal: 0,
      status: "pendente" as const,
      installments: [],
    }]);
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

  // CRUD - Income Sources
  const addIncomeSource = useCallback((label: string, amount: number) => {
    setIncomeSources((prev) => [...prev, { id: `inc-${Date.now()}`, label, amount }]);
  }, []);

  const removeIncomeSource = useCallback((id: string) => {
    setIncomeSources((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateIncomeSource = useCallback((id: string, updates: Partial<Pick<IncomeSource, "label" | "amount">>) => {
    setIncomeSources((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }, []);

  return {
    banks, cashflowMonths, creditors, goals, monthlySnapshots, incomeSources,
    selectedMonth, selectedBank, currentCashflow,
    totalDebt, totalIncome, totalExpense, expectedBalance,
    totalCreditorsDebt, totalCreditorsPaid, savingsGoalMonth,
    allInstallments,
    setSelectedMonth, setSelectedBank, nextMonth, prevMonth,
    updateBankBalance, toggleCashflowPaid, depositToGoal,
    addCashflowItem, removeCashflowItem, updateCashflowItem,
    addCreditor, removeCreditor, updateCreditor,
    addGoal, removeGoal, updateGoal,
    updateBank, addBank, addInstallment, removeInstallment, updateInstallment,
    setSavingsGoalMonth, addIncomeSource, removeIncomeSource, updateIncomeSource,
    salary, monthlyHours, hourlyRate, safetyMargin, dailySavings,
    phantomBalance, survivalDays,
    setSalary, setMonthlyHours, setSafetyMargin,
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
