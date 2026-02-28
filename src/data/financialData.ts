export type BankId = "nubank" | "inter" | "c6" | "itau" | "bb";

export interface Bank {
  id: BankId;
  name: string;
  color: string;
  glowClass: string;
  limitTotal: number;
  limitUsed: number;
  debtFinal: number;
  status: "pendente" | "pago" | "parcial";
  installments: Installment[];
}

export interface Installment {
  id: string;
  description: string;
  totalAmount: number;
  installmentAmount: number;
  currentInstallment: number;
  totalInstallments: number;
  dueDate: string;
  status: "pendente" | "pago" | "atrasado";
}

export interface CashflowMonth {
  month: string;
  year: number;
  incomes: { label: string; amount: number }[];
  expenses: { label: string; amount: number }[];
}

export interface Creditor {
  id: string;
  name: string;
  totalDebt: number;
  amountPaid: number;
}

export const banks: Bank[] = [
  {
    id: "nubank",
    name: "Nubank",
    color: "bank-nubank",
    glowClass: "glow-nubank",
    limitTotal: 12000,
    limitUsed: 8750,
    debtFinal: 8750,
    status: "pendente",
    installments: [
      { id: "nu1", description: "iPhone 15 Pro", totalAmount: 6000, installmentAmount: 500, currentInstallment: 4, totalInstallments: 12, dueDate: "2026-03-10", status: "pendente" },
      { id: "nu2", description: "Curso Rocketseat", totalAmount: 2400, installmentAmount: 200, currentInstallment: 6, totalInstallments: 12, dueDate: "2026-03-10", status: "pendente" },
      { id: "nu3", description: "Notebook Dell", totalAmount: 4800, installmentAmount: 400, currentInstallment: 2, totalInstallments: 12, dueDate: "2026-03-15", status: "pendente" },
      { id: "nu4", description: "Assinatura Adobe", totalAmount: 1200, installmentAmount: 100, currentInstallment: 8, totalInstallments: 12, dueDate: "2026-03-05", status: "pago" },
    ],
  },
  {
    id: "inter",
    name: "Inter",
    color: "bank-inter",
    glowClass: "glow-inter",
    limitTotal: 8000,
    limitUsed: 9200,
    debtFinal: 9200,
    status: "pendente",
    installments: [
      { id: "in1", description: "Geladeira Brastemp", totalAmount: 3600, installmentAmount: 300, currentInstallment: 3, totalInstallments: 12, dueDate: "2026-03-12", status: "pendente" },
      { id: "in2", description: "Seguro Auto", totalAmount: 2400, installmentAmount: 200, currentInstallment: 5, totalInstallments: 12, dueDate: "2026-03-12", status: "pendente" },
      { id: "in3", description: "Móveis Sala", totalAmount: 5200, installmentAmount: 433.33, currentInstallment: 1, totalInstallments: 12, dueDate: "2026-04-12", status: "pendente" },
    ],
  },
  {
    id: "c6",
    name: "C6 Bank",
    color: "bank-c6",
    glowClass: "glow-c6",
    limitTotal: 5000,
    limitUsed: 5800,
    debtFinal: 5800,
    status: "pendente",
    installments: [
      { id: "c61", description: "Viagem Nordeste", totalAmount: 4800, installmentAmount: 400, currentInstallment: 2, totalInstallments: 12, dueDate: "2026-03-20", status: "pendente" },
      { id: "c62", description: "Roupas Renner", totalAmount: 1200, installmentAmount: 200, currentInstallment: 4, totalInstallments: 6, dueDate: "2026-03-20", status: "pendente" },
    ],
  },
  {
    id: "itau",
    name: "Itaú",
    color: "bank-itau",
    glowClass: "glow-itau",
    limitTotal: 15000,
    limitUsed: 6300,
    debtFinal: 6300,
    status: "parcial",
    installments: [
      { id: "it1", description: "Reforma Banheiro", totalAmount: 8000, installmentAmount: 666.67, currentInstallment: 3, totalInstallments: 12, dueDate: "2026-03-08", status: "pendente" },
      { id: "it2", description: "TV Samsung 65\"", totalAmount: 3600, installmentAmount: 300, currentInstallment: 7, totalInstallments: 12, dueDate: "2026-03-08", status: "pago" },
    ],
  },
  {
    id: "bb",
    name: "Banco do Brasil",
    color: "bank-bb",
    glowClass: "glow-bb",
    limitTotal: 10000,
    limitUsed: 3200,
    debtFinal: 3200,
    status: "parcial",
    installments: [
      { id: "bb1", description: "Empréstimo Consignado", totalAmount: 12000, installmentAmount: 600, currentInstallment: 9, totalInstallments: 20, dueDate: "2026-03-05", status: "pendente" },
      { id: "bb2", description: "Cartão Compras", totalAmount: 2600, installmentAmount: 260, currentInstallment: 5, totalInstallments: 10, dueDate: "2026-03-15", status: "pendente" },
    ],
  },
];

export const cashflowMonths: CashflowMonth[] = [
  {
    month: "Março",
    year: 2026,
    incomes: [
      { label: "Salário", amount: 8500 },
      { label: "Freelance", amount: 2200 },
      { label: "Dividendos", amount: 380 },
    ],
    expenses: [
      { label: "Aluguel", amount: 2800 },
      { label: "Parcelas Cartões", amount: 3860 },
      { label: "Alimentação", amount: 1200 },
      { label: "Transporte", amount: 450 },
      { label: "Lazer", amount: 600 },
    ],
  },
  {
    month: "Abril",
    year: 2026,
    incomes: [
      { label: "Salário", amount: 8500 },
      { label: "Freelance", amount: 1800 },
    ],
    expenses: [
      { label: "Aluguel", amount: 2800 },
      { label: "Parcelas Cartões", amount: 4293 },
      { label: "Alimentação", amount: 1200 },
      { label: "Transporte", amount: 450 },
    ],
  },
  {
    month: "Maio",
    year: 2026,
    incomes: [
      { label: "Salário", amount: 8500 },
      { label: "Freelance", amount: 2500 },
      { label: "13º (parcela)", amount: 4250 },
    ],
    expenses: [
      { label: "Aluguel", amount: 2800 },
      { label: "Parcelas Cartões", amount: 4293 },
      { label: "Alimentação", amount: 1200 },
      { label: "IPVA", amount: 1800 },
    ],
  },
];

export const creditors: Creditor[] = [
  { id: "cr1", name: "João Silva", totalDebt: 5000, amountPaid: 3500 },
  { id: "cr2", name: "Maria Souza", totalDebt: 2000, amountPaid: 800 },
  { id: "cr3", name: "Pedro Almeida", totalDebt: 3500, amountPaid: 3500 },
  { id: "cr4", name: "Ana Costa", totalDebt: 1500, amountPaid: 500 },
];
