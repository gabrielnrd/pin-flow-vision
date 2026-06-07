import { useState, useEffect, useCallback, useRef, createContext, useContext, type ReactNode, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  banks as initialBanks,
  cashflowMonths as initialCashflow,
  creditors as initialCreditors,
  initialGoals,
  monthlySnapshots,
  type Bank,
  type BankId,
  type CashflowMonth,
  type CashflowItem,
  type Creditor,
  type Goal,
  type MonthlySnapshot,
} from "@/data/financialData";

export interface IncomeSource {
  id: string;
  label: string;
  amount: number;
}

export type TripDirection = "ida" | "volta";

export interface TransportEntry {
  id: string;
  service: string;
  direction: TripDirection;
  amount: number;
  date: string;
}

export interface LifeTask {
  id: string;
  title: string;
  xpReward: number;
  completedThisWeek: boolean;
}

interface PersistedData {
  banks: Bank[];
  cashflowMonths: CashflowMonth[];
  creditors: Creditor[];
  goals: Goal[];
  incomeSources: IncomeSource[];
  savingsGoalMonth: number;
  salary: number;
  monthlyHours: number;
  safetyMargin: number;
  lifeXp: number;
  lifeTasks: LifeTask[];
  transportEntries: TransportEntry[];
  transportBalance: number;
  savedBalance: number;
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
  cardExpensesForMonth: number;
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
  addCashflowItem: (monthIdx: number, type: "incomes" | "expenses", label: string, amount: number, category?: string) => void;
  removeCashflowItem: (monthIdx: number, type: "incomes" | "expenses", itemIdx: number) => void;
  updateCashflowItem: (monthIdx: number, type: "incomes" | "expenses", itemIdx: number, label: string, amount: number, category?: string) => void;
  setCashflowItemFixed: (monthIdx: number, type: "incomes" | "expenses", itemIdx: number, fixed: boolean) => void;
  replicateFixedItem: (monthIdx: number, type: "incomes" | "expenses", itemIdx: number) => void;
  addCreditor: (name: string, totalDebt: number) => void;
  removeCreditor: (id: string) => void;
  updateCreditor: (id: string, updates: Partial<Pick<Creditor, "name" | "totalDebt" | "amountPaid" | "interestRate" | "dueDate">>) => void;
  addGoal: (title: string, targetAmount: number) => void;
  removeGoal: (id: string) => void;
  updateGoal: (id: string, updates: Partial<Pick<Goal, "title" | "targetAmount" | "image">>) => void;
  updateBank: (bankId: BankId, updates: Partial<Pick<Bank, "name" | "limitTotal" | "status" | "color" | "glowClass">>) => void;
  removeBank: (bankId: BankId) => void;
  addBank: (name: string, limitTotal: number, color: string, glowClass: string) => void;
  addInstallment: (bankId: BankId, inst: Omit<import("@/data/financialData").Installment, "id">) => void;
  removeInstallment: (bankId: BankId, installmentId: string) => void;
  updateInstallment: (bankId: BankId, installmentId: string, updates: Partial<Omit<import("@/data/financialData").Installment, "id">>) => void;
  setSavingsGoalMonth: (v: number) => void;
  addIncomeSource: (label: string, amount: number) => void;
  removeIncomeSource: (id: string) => void;
  updateIncomeSource: (id: string, updates: Partial<Pick<IncomeSource, "label" | "amount">>) => void;
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
  lifeXp: number;
  lifeTasks: LifeTask[];
  addLifeTask: (title: string, xpReward: number) => void;
  removeLifeTask: (id: string) => void;
  completeLifeTask: (id: string) => void;
  resetWeeklyTasks: () => void;
  transportEntries: TransportEntry[];
  transportBalance: number;
  addTransportEntry: (entry: Omit<TransportEntry, "id">) => void;
  removeTransportEntry: (id: string) => void;
  setTransportBalance: (v: number) => void;
  cloudLoading: boolean;
}

const DEFAULTS: PersistedData = {
  banks: initialBanks,
  cashflowMonths: initialCashflow,
  creditors: initialCreditors,
  goals: initialGoals,
  incomeSources: [
    { id: "inc-1", label: "Salário", amount: 8500 },
    { id: "inc-2", label: "Freelance", amount: 2000 },
  ],
  savingsGoalMonth: 2000,
  salary: 1900,
  monthlyHours: 220,
  safetyMargin: 300,
  lifeXp: 0,
  lifeTasks: [
    { id: "task-1", title: "Ler 1 livro", xpReward: 100, completedThisWeek: false },
    { id: "task-2", title: "Ir para a academia 3x", xpReward: 50, completedThisWeek: false },
  ],
  transportEntries: [],
  transportBalance: 0,
  savedBalance: 0,
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function mergeCashflow(stored: CashflowMonth[], fallback: CashflowMonth[]): CashflowMonth[] {
  const storedKeys = new Set(stored.map((m) => `${m.month}-${m.year}`));
  const newMonths = fallback.filter((m) => !storedKeys.has(`${m.month}-${m.year}`));
  return newMonths.length > 0 ? [...stored, ...newMonths] : stored;
}

function getLocalData(): PersistedData {
  return {
    banks: loadFromStorage("fin_banks", DEFAULTS.banks),
    cashflowMonths: mergeCashflow(loadFromStorage("fin_cashflow", DEFAULTS.cashflowMonths), DEFAULTS.cashflowMonths),
    creditors: loadFromStorage("fin_creditors", DEFAULTS.creditors),
    goals: loadFromStorage("fin_goals", DEFAULTS.goals),
    incomeSources: loadFromStorage("fin_incomeSources", DEFAULTS.incomeSources),
    savingsGoalMonth: loadFromStorage("fin_savingsGoal", DEFAULTS.savingsGoalMonth),
    salary: loadFromStorage("fin_salary", DEFAULTS.salary),
    monthlyHours: loadFromStorage("fin_monthlyHours", DEFAULTS.monthlyHours),
    safetyMargin: loadFromStorage("fin_safetyMargin", DEFAULTS.safetyMargin),
    lifeXp: loadFromStorage("fin_lifeXp", DEFAULTS.lifeXp),
    lifeTasks: loadFromStorage("fin_lifeTasks", DEFAULTS.lifeTasks),
    transportEntries: loadFromStorage("fin_transportEntries", DEFAULTS.transportEntries),
    transportBalance: loadFromStorage("fin_transportBalance", DEFAULTS.transportBalance),
  };
}

function saveToLocal(data: PersistedData) {
  localStorage.setItem("fin_banks", JSON.stringify(data.banks));
  localStorage.setItem("fin_cashflow", JSON.stringify(data.cashflowMonths));
  localStorage.setItem("fin_creditors", JSON.stringify(data.creditors));
  localStorage.setItem("fin_goals", JSON.stringify(data.goals));
  localStorage.setItem("fin_incomeSources", JSON.stringify(data.incomeSources));
  localStorage.setItem("fin_savingsGoal", JSON.stringify(data.savingsGoalMonth));
  localStorage.setItem("fin_salary", JSON.stringify(data.salary));
  localStorage.setItem("fin_monthlyHours", JSON.stringify(data.monthlyHours));
  localStorage.setItem("fin_safetyMargin", JSON.stringify(data.safetyMargin));
  localStorage.setItem("fin_lifeXp", JSON.stringify(data.lifeXp));
  localStorage.setItem("fin_lifeTasks", JSON.stringify(data.lifeTasks));
  localStorage.setItem("fin_transportEntries", JSON.stringify(data.transportEntries));
  localStorage.setItem("fin_transportBalance", JSON.stringify(data.transportBalance));
}

function useFinanceStoreInternal(): FinanceStore {
  const { user } = useAuth();
  const [cloudLoading, setCloudLoading] = useState(true);
  const [banksRaw, setBanks] = useState<Bank[]>(DEFAULTS.banks);
  const [cashflowMonths, setCashflowMonths] = useState<CashflowMonth[]>(DEFAULTS.cashflowMonths);
  const [creditors, setCreditors] = useState<Creditor[]>(DEFAULTS.creditors);
  const [goals, setGoals] = useState<Goal[]>(DEFAULTS.goals);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const MONTHS_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    const now = new Date();
    const idx = DEFAULTS.cashflowMonths.findIndex(
      (m) => m.month === MONTHS_PT[now.getMonth()] && m.year === now.getFullYear()
    );
    return idx >= 0 ? idx : 0;
  });
  const [selectedBankId, setSelectedBankId] = useState<BankId | null>(null);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>(DEFAULTS.incomeSources);
  const [savingsGoalMonth, setSavingsGoalMonth] = useState(DEFAULTS.savingsGoalMonth);
  const [salary, setSalary] = useState(DEFAULTS.salary);
  const [monthlyHours, setMonthlyHours] = useState(DEFAULTS.monthlyHours);
  const [safetyMargin, setSafetyMargin] = useState(DEFAULTS.safetyMargin);
  const [lifeXp, setLifeXp] = useState(DEFAULTS.lifeXp);
  const [lifeTasks, setLifeTasks] = useState<LifeTask[]>(DEFAULTS.lifeTasks);
  const [transportEntries, setTransportEntries] = useState<TransportEntry[]>(DEFAULTS.transportEntries);
  const [transportBalance, setTransportBalance] = useState(DEFAULTS.transportBalance);
  const initialLoadDone = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from Supabase on mount / user change
  useEffect(() => {
    if (!user) {
      setCloudLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setCloudLoading(true);
      try {
        const { data } = await supabase
          .from("user_financial_data")
          .select("data")
          .eq("user_id", user.id)
          .maybeSingle();
        if (cancelled) return;
        if (data?.data) {
          const d = data.data as unknown as PersistedData;
          setBanks(d.banks ?? DEFAULTS.banks);
          setCashflowMonths(d.cashflowMonths ? mergeCashflow(d.cashflowMonths, DEFAULTS.cashflowMonths) : DEFAULTS.cashflowMonths);
          setCreditors(d.creditors ?? DEFAULTS.creditors);
          setGoals(d.goals ?? DEFAULTS.goals);
          setIncomeSources(d.incomeSources ?? DEFAULTS.incomeSources);
          setSavingsGoalMonth(d.savingsGoalMonth ?? DEFAULTS.savingsGoalMonth);
          setSalary(d.salary ?? DEFAULTS.salary);
          setMonthlyHours(d.monthlyHours ?? DEFAULTS.monthlyHours);
          setSafetyMargin(d.safetyMargin ?? DEFAULTS.safetyMargin);
          setLifeXp(d.lifeXp ?? DEFAULTS.lifeXp);
          setLifeTasks(d.lifeTasks ?? DEFAULTS.lifeTasks);
          setTransportEntries(d.transportEntries ?? DEFAULTS.transportEntries);
          setTransportBalance(d.transportBalance ?? DEFAULTS.transportBalance);
        } else {
          // No cloud data — try migrating from localStorage
          const local = getLocalData();
          const hasLocalData = localStorage.getItem("fin_banks") !== null;
          if (hasLocalData) {
            setBanks(local.banks);
            setCashflowMonths(local.cashflowMonths);
            setCreditors(local.creditors);
            setGoals(local.goals);
            setIncomeSources(local.incomeSources);
            setSavingsGoalMonth(local.savingsGoalMonth);
            setSalary(local.salary);
            setMonthlyHours(local.monthlyHours);
            setSafetyMargin(local.safetyMargin);
            setLifeXp(local.lifeXp);
            setLifeTasks(local.lifeTasks);
            setTransportEntries(local.transportEntries);
            setTransportBalance(local.transportBalance);
          }
        }
      } catch (e) {
        console.error("Failed to load cloud data:", e);
      }
      if (!cancelled) {
        initialLoadDone.current = true;
        setCloudLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Save to localStorage on changes
  const getPersistedData = useCallback((): PersistedData => ({
    banks: banksRaw,
    cashflowMonths,
    creditors,
    goals,
    incomeSources,
    savingsGoalMonth,
    salary,
    monthlyHours,
    safetyMargin,
    lifeXp,
    lifeTasks,
    transportEntries,
    transportBalance,
  }), [banksRaw, cashflowMonths, creditors, goals, incomeSources, savingsGoalMonth, salary, monthlyHours, safetyMargin, lifeXp, lifeTasks, transportEntries, transportBalance]);

  // Save to localStorage + Supabase (debounced)
  useEffect(() => {
    if (!initialLoadDone.current) return;
    const data = getPersistedData();
    saveToLocal(data);

    if (!user) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const { data: existing } = await supabase
          .from("user_financial_data")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (existing) {
          await supabase
            .from("user_financial_data")
            .update({ data: data as unknown as import("@/integrations/supabase/types").Json, updated_at: new Date().toISOString() })
            .eq("user_id", user.id);
        } else {
          await supabase
            .from("user_financial_data")
            .insert({ user_id: user.id, data: data as unknown as import("@/integrations/supabase/types").Json });
        }
      } catch (e) {
        console.error("Failed to save to cloud:", e);
      }
    }, 2000);
  }, [getPersistedData, user]);

  // Derive limitUsed and debtFinal from installments
  const banks = banksRaw.map((b) => {
    const usedFromInstallments = b.installments
      .filter((inst) => inst.status !== "pago")
      .reduce((sum, inst) => sum + inst.installmentAmount, 0);
    return { ...b, limitUsed: usedFromInstallments, debtFinal: usedFromInstallments };
  });

  const selectedBank = selectedBankId ? banks.find((b) => b.id === selectedBankId) ?? null : null;
  const setSelectedBank = useCallback((b: Bank | null) => setSelectedBankId(b?.id ?? null), []);

  const currentCashflow = cashflowMonths[selectedMonth];
  const hourlyRate = monthlyHours > 0 ? salary / monthlyHours : 0;
  const dailySavings = savingsGoalMonth > 0 ? savingsGoalMonth / 30 : 0;

  // Map Portuguese month names to month numbers
  const MONTH_MAP: Record<string, number> = {
    "Janeiro": 1, "Fevereiro": 2, "Março": 3, "Abril": 4, "Maio": 5, "Junho": 6,
    "Julho": 7, "Agosto": 8, "Setembro": 9, "Outubro": 10, "Novembro": 11, "Dezembro": 12,
  };

  // Compute card installments total for the current cashflow month
  const cardExpensesForMonth = useMemo(() => {
    const monthNum = MONTH_MAP[currentCashflow.month];
    const year = currentCashflow.year;
    if (!monthNum) return 0;
    return banks.reduce((total, bank) => {
      return total + bank.installments
        .filter((inst) => {
          const d = new Date(inst.dueDate + "T00:00:00");
          return d.getMonth() + 1 === monthNum && d.getFullYear() === year;
        })
        .reduce((sum, inst) => sum + inst.installmentAmount, 0);
    }, 0);
  }, [banks, currentCashflow.month, currentCashflow.year]);

  const totalBankDebt = banks.reduce((sum, b) => sum + b.limitUsed, 0);
  const totalCreditorsDebt = creditors.reduce((s, c) => s + c.totalDebt, 0);
  const totalCreditorsPaid = creditors.reduce((s, c) => s + c.amountPaid, 0);
  const totalCreditorsRemaining = totalCreditorsDebt - totalCreditorsPaid;
  const totalDebt = totalBankDebt + totalCreditorsRemaining;
  const totalIncome = currentCashflow.incomes.reduce((s, i) => s + i.amount, 0);
  const manualExpenses = currentCashflow.expenses.reduce((s, e) => s + e.amount, 0);
  const totalExpense = manualExpenses + cardExpensesForMonth;
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

  const updateBankBalance = useCallback((_bankId: BankId, _newUsed: number) => {}, []);

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

  const addCashflowItem = useCallback((monthIdx: number, type: "incomes" | "expenses", label: string, amount: number, category?: string) => {
    setCashflowMonths((prev) =>
      prev.map((m, mi) => {
        if (mi !== monthIdx) return m;
        return { ...m, [type]: [...m[type], { label, amount, paid: false, category }] };
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

  const updateCashflowItem = useCallback((monthIdx: number, type: "incomes" | "expenses", itemIdx: number, label: string, amount: number, category?: string) => {
    setCashflowMonths((prev) =>
      prev.map((m, mi) => {
        if (mi !== monthIdx) return m;
        const items = [...m[type]];
        items[itemIdx] = { ...items[itemIdx], label, amount, ...(category !== undefined ? { category } : {}) };
        return { ...m, [type]: items };
      })
    );
  }, []);

  const setCashflowItemFixed = useCallback((monthIdx: number, type: "incomes" | "expenses", itemIdx: number, fixed: boolean) => {
    setCashflowMonths((prev) =>
      prev.map((m, mi) => {
        if (mi !== monthIdx) return m;
        const items = [...m[type]];
        items[itemIdx] = { ...items[itemIdx], fixed };
        return { ...m, [type]: items };
      })
    );
  }, []);

  const replicateFixedItem = useCallback((monthIdx: number, type: "incomes" | "expenses", itemIdx: number) => {
    setCashflowMonths((prev) => {
      const source = prev[monthIdx]?.[type]?.[itemIdx];
      if (!source) return prev;
      return prev.map((m, mi) => {
        if (mi <= monthIdx) {
          if (mi === monthIdx) {
            const items = [...m[type]];
            items[itemIdx] = { ...items[itemIdx], fixed: true };
            return { ...m, [type]: items };
          }
          return m;
        }
        // skip if exact label already exists
        const exists = m[type].some((it) => it.label.trim().toLowerCase() === source.label.trim().toLowerCase());
        if (exists) return m;
        const newItem: CashflowItem = {
          label: source.label,
          amount: source.amount,
          category: source.category,
          fixed: true,
          paid: false,
        };
        return { ...m, [type]: [...m[type], newItem] };
      });
    });
  }, []);

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

  const updateBank = useCallback((bankId: BankId, updates: Partial<Pick<Bank, "name" | "limitTotal" | "status" | "color" | "glowClass">>) => {
    setBanks((prev) => prev.map((b) => (b.id === bankId ? { ...b, ...updates } : b)));
  }, []);

  const removeBank = useCallback((bankId: BankId) => {
    setBanks((prev) => prev.filter((b) => b.id !== bankId));
  }, []);

  const addBank = useCallback((name: string, limitTotal: number, color: string, glowClass: string) => {
    const id = `bank-${Date.now()}` as BankId;
    setBanks((prev) => [...prev, {
      id, name, color, glowClass, limitTotal, limitUsed: 0, debtFinal: 0,
      status: "pendente" as const, installments: [],
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

  const addIncomeSource = useCallback((label: string, amount: number) => {
    setIncomeSources((prev) => [...prev, { id: `inc-${Date.now()}`, label, amount }]);
  }, []);

  const removeIncomeSource = useCallback((id: string) => {
    setIncomeSources((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateIncomeSource = useCallback((id: string, updates: Partial<Pick<IncomeSource, "label" | "amount">>) => {
    setIncomeSources((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }, []);

  const addLifeTask = useCallback((title: string, xpReward: number) => {
    setLifeTasks((prev) => [...prev, { id: `lt-${Date.now()}`, title, xpReward, completedThisWeek: false }]);
  }, []);

  const removeLifeTask = useCallback((id: string) => {
    setLifeTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const completeLifeTask = useCallback((id: string) => {
    setLifeTasks((prev) => prev.map((t) => {
      if (t.id === id && !t.completedThisWeek) {
        setLifeXp((xp) => xp + t.xpReward);
        return { ...t, completedThisWeek: true };
      }
      return t;
    }));
  }, []);

  const resetWeeklyTasks = useCallback(() => {
    setLifeTasks((prev) => prev.map((t) => ({ ...t, completedThisWeek: false })));
  }, []);

  const addTransportEntry = useCallback((entry: Omit<TransportEntry, "id">) => {
    setTransportEntries((prev) => [{ ...entry, id: `t-${Date.now()}` }, ...prev]);
  }, []);

  const removeTransportEntry = useCallback((id: string) => {
    setTransportEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return {
    banks, cashflowMonths, creditors, goals, monthlySnapshots, incomeSources,
    selectedMonth, selectedBank, currentCashflow,
    totalDebt, totalIncome, totalExpense, cardExpensesForMonth, expectedBalance,
    totalCreditorsDebt, totalCreditorsPaid, savingsGoalMonth,
    allInstallments,
    setSelectedMonth, setSelectedBank, nextMonth, prevMonth,
    updateBankBalance, toggleCashflowPaid, depositToGoal,
    addCashflowItem, removeCashflowItem, updateCashflowItem, setCashflowItemFixed, replicateFixedItem,
    addCreditor, removeCreditor, updateCreditor,
    addGoal, removeGoal, updateGoal,
    updateBank, removeBank, addBank, addInstallment, removeInstallment, updateInstallment,
    setSavingsGoalMonth, addIncomeSource, removeIncomeSource, updateIncomeSource,
    salary, monthlyHours, hourlyRate, safetyMargin, dailySavings,
    phantomBalance, survivalDays,
    setSalary, setMonthlyHours, setSafetyMargin,
    lifeXp, lifeTasks, addLifeTask, removeLifeTask, completeLifeTask, resetWeeklyTasks,
    transportEntries, transportBalance, addTransportEntry, removeTransportEntry, setTransportBalance,
    cloudLoading,
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
