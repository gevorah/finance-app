import { Account, ACCOUNT_TYPES, DEFAULT_ACCOUNT_ID } from '@/entities/account';
import { Budget } from '@/entities/budget';
import { CATEGORY_TYPES } from '@/entities/category';
import { Debt } from '@/entities/debt';
import { Transaction } from '@/entities/transaction';
import { toMinorUnits } from '@/shared/lib/money';

import { useAccountStore } from './accountStore';
import { useBudgetStore } from './budgetStore';
import { useDebtStore } from './debtStore';
import { useTransactionStore } from './transactionStore';

const SAVINGS_ACCOUNT_ID = 'sample-savings';
const CARD_ACCOUNT_ID = 'sample-card';

const EPOCH = '2026-01-01T00:00:00.000Z';

function dayOfCurrentMonth(day: number): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${String(day).padStart(2, '0')}`;
}

export const SAMPLE_ACCOUNTS: Account[] = [
  {
    id: DEFAULT_ACCOUNT_ID,
    name: 'Cash',
    type: ACCOUNT_TYPES.CASH,
    initialBalance: toMinorUnits(200000),
    onBudget: true,
    archived: false,
    createdAt: EPOCH,
    updatedAt: EPOCH,
  },
  {
    id: SAVINGS_ACCOUNT_ID,
    name: 'Bancolombia Ahorros',
    type: ACCOUNT_TYPES.SAVINGS,
    initialBalance: toMinorUnits(1500000),
    onBudget: false,
    archived: false,
    createdAt: EPOCH,
    updatedAt: EPOCH,
  },
  {
    id: CARD_ACCOUNT_ID,
    name: 'RappiCard',
    type: ACCOUNT_TYPES.CREDIT_CARD,
    initialBalance: toMinorUnits(-850000),
    onBudget: true,
    creditLimit: toMinorUnits(3000000),
    cutOffDay: 5,
    paymentDueDay: 20,
    archived: false,
    createdAt: EPOCH,
    updatedAt: EPOCH,
  },
];

const sampleTransaction = (
  id: string,
  type: Transaction['type'],
  description: string,
  category: Transaction['category'],
  majorAmount: number,
  day: number,
  accountId: string = DEFAULT_ACCOUNT_ID,
): Transaction => ({
  id,
  type,
  accountId,
  category,
  description,
  amount: toMinorUnits(majorAmount),
  date: dayOfCurrentMonth(day),
  createdAt: EPOCH,
  updatedAt: EPOCH,
});

export const SAMPLE_TRANSACTIONS: Transaction[] = [
  sampleTransaction('s1', 'income', 'Monthly Salary', CATEGORY_TYPES.SALARY, 4500000, 1, SAVINGS_ACCOUNT_ID),
  sampleTransaction('s2', 'expense', 'Electricity Bill', CATEGORY_TYPES.BILLS, 180000, 5),
  sampleTransaction('s3', 'expense', 'Bus Pass', CATEGORY_TYPES.TRANSPORT, 60000, 3),
  sampleTransaction('s4', 'expense', 'Zara', CATEGORY_TYPES.SHOPPING, 189000, 8, CARD_ACCOUNT_ID),
  sampleTransaction('s5', 'expense', 'Helado', CATEGORY_TYPES.FOOD, 15000, 10),
  sampleTransaction('s6', 'expense', 'Panadería', CATEGORY_TYPES.FOOD, 28000, 12),
  sampleTransaction('s7', 'expense', 'Cita médica', CATEGORY_TYPES.HEALTH, 95000, 14),
  sampleTransaction('s8', 'expense', 'Restaurant', CATEGORY_TYPES.FOOD, 85000, 15, CARD_ACCOUNT_ID),
  sampleTransaction('s9', 'expense', 'Carulla', CATEGORY_TYPES.FOOD, 120000, 18),
  sampleTransaction('s10', 'expense', 'Rappi Order', CATEGORY_TYPES.FOOD, 45000, 20, CARD_ACCOUNT_ID),
  {
    id: 's11',
    type: 'transfer',
    accountId: SAVINGS_ACCOUNT_ID,
    transferAccountId: DEFAULT_ACCOUNT_ID,
    description: 'Retiro cajero',
    amount: toMinorUnits(300000),
    date: dayOfCurrentMonth(2),
    createdAt: EPOCH,
    updatedAt: EPOCH,
  },
];

const sampleBudget = (
  id: string,
  category: Budget['category'],
  majorLimit: number,
): Budget => ({
  id,
  category,
  monthlyLimit: toMinorUnits(majorLimit),
  createdAt: EPOCH,
  updatedAt: EPOCH,
});

export const SAMPLE_BUDGETS: Budget[] = [
  sampleBudget('b1', CATEGORY_TYPES.FOOD, 600000),
  sampleBudget('b2', CATEGORY_TYPES.TRANSPORT, 200000),
  sampleBudget('b3', CATEGORY_TYPES.SHOPPING, 250000),
  sampleBudget('b4', CATEGORY_TYPES.BILLS, 2350000),
  sampleBudget('b5', CATEGORY_TYPES.HEALTH, 150000),
  sampleBudget('b6', CATEGORY_TYPES.OTHERS, 300000),
];

export const SAMPLE_DEBTS: Debt[] = [
  {
    id: 'd1',
    creditorName: 'Bancolombia',
    type: 'loan',
    originalAmount: toMinorUnits(30000000),
    currentBalance: toMinorUnits(22000000),
    interest: { type: 'fixed', rate: 1.8, period: 'monthly' },
    paymentTerms: {
      type: 'installments',
      installmentAmount: toMinorUnits(1219706),
      totalInstallments: 36,
      paidInstallments: 10,
      frequency: 'monthly',
      nextPaymentDueDate: dayOfCurrentMonth(15),
    },
    startDate: '2025-09-01',
    description: 'Crédito libre inversión',
    priority: 1,
    status: 'current',
    createdAt: EPOCH,
    updatedAt: EPOCH,
  },
  {
    id: 'd2',
    creditorName: 'RappiCard',
    type: 'credit_card',
    originalAmount: toMinorUnits(1000000),
    currentBalance: toMinorUnits(850000),
    interest: { type: 'fixed', rate: 2.1, period: 'monthly' },
    paymentTerms: {
      type: 'revolving',
      minimumPayment: toMinorUnits(95000),
      statementBalance: toMinorUnits(850000),
      cutOffDay: 5,
      nextPaymentDueDate: dayOfCurrentMonth(20),
    },
    startDate: '2026-06-01',
    description: 'Tarjeta de crédito',
    priority: 2,
    status: 'current',
    createdAt: EPOCH,
    updatedAt: EPOCH,
  },
];

export function loadSampleData(): void {
  useAccountStore.setState({ accounts: SAMPLE_ACCOUNTS });
  useTransactionStore.setState({ transactions: SAMPLE_TRANSACTIONS });
  useBudgetStore.setState({ budgets: SAMPLE_BUDGETS });
  useDebtStore.setState({ debts: SAMPLE_DEBTS });
}

export function clearAllData(): void {
  useTransactionStore.setState({ transactions: [] });
  useBudgetStore.setState({ budgets: [] });
  useDebtStore.setState({ debts: [] });
}
