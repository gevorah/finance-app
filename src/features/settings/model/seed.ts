import {
  Account,
  ACCOUNT_KINDS,
  ACCOUNT_ROOTS,
  DEFAULT_CASH_ACCOUNT_ID,
  DEFAULT_CHART_OF_ACCOUNTS,
  DEFAULT_INCOME_ACCOUNT_ID,
  indexAccounts,
  OPENING_BALANCE_ACCOUNT_ID,
  useAccountStore,
} from '@/entities/account';
import { Budget, useBudgetStore } from '@/entities/budget';
import { Debt, useDebtStore } from '@/entities/debt';
import {
  buildPostings,
  Transaction,
  TRANSACTION_KINDS,
  TransactionKind,
  useTransactionStore,
} from '@/entities/transaction';
import { toMinorUnits } from '@/shared/lib/money';

const SAVINGS_ACCOUNT_ID = 'assets-savings';
const CARD_ACCOUNT_ID = 'liabilities-card';

const EPOCH = '2026-01-01T00:00:00.000Z';

function dayOfCurrentMonth(day: number): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${String(day).padStart(2, '0')}`;
}

export const SAMPLE_ACCOUNTS: Account[] = [
  ...DEFAULT_CHART_OF_ACCOUNTS,
  {
    id: SAVINGS_ACCOUNT_ID,
    name: 'Bancolombia Ahorros',
    root: ACCOUNT_ROOTS.ASSETS,
    kind: ACCOUNT_KINDS.SAVINGS,
    onBudget: false,
    archived: false,
    createdAt: EPOCH,
    updatedAt: EPOCH,
  },
  {
    id: CARD_ACCOUNT_ID,
    name: 'RappiCard',
    root: ACCOUNT_ROOTS.LIABILITIES,
    kind: ACCOUNT_KINDS.CREDIT_CARD,
    onBudget: true,
    creditLimit: toMinorUnits(3000000),
    cutOffDay: 5,
    paymentDueDay: 20,
    archived: false,
    createdAt: EPOCH,
    updatedAt: EPOCH,
  },
];

const openingBalance = (
  id: string,
  accountId: string,
  majorAmount: number,
): Transaction => ({
  id,
  date: dayOfCurrentMonth(1),
  description: 'Opening balance',
  postings: [
    { accountId: OPENING_BALANCE_ACCOUNT_ID, amount: -toMinorUnits(majorAmount) },
    { accountId, amount: toMinorUnits(majorAmount) },
  ],
  createdAt: EPOCH,
  updatedAt: EPOCH,
});

const SAMPLE_ACCOUNTS_BY_ID = indexAccounts(SAMPLE_ACCOUNTS);

const sampleTransaction = (
  id: string,
  kind: TransactionKind,
  description: string,
  counterAccountId: string,
  majorAmount: number,
  day: number,
  accountId: string = DEFAULT_CASH_ACCOUNT_ID,
): Transaction => ({
  id,
  date: dayOfCurrentMonth(day),
  description,
  postings: buildPostings(
    {
      amount: toMinorUnits(majorAmount),
      accountId,
      counterAccountId,
    },
    SAMPLE_ACCOUNTS_BY_ID,
  ),
  createdAt: EPOCH,
  updatedAt: EPOCH,
});

const { EXPENSE, INCOME, TRANSFER } = TRANSACTION_KINDS;

export const SAMPLE_TRANSACTIONS: Transaction[] = [
  openingBalance('open-cash', DEFAULT_CASH_ACCOUNT_ID, 200000),
  openingBalance('open-savings', SAVINGS_ACCOUNT_ID, 1500000),
  openingBalance('open-card', CARD_ACCOUNT_ID, -850000),
  sampleTransaction('s1', INCOME, 'Monthly Salary', DEFAULT_INCOME_ACCOUNT_ID, 4500000, 1, SAVINGS_ACCOUNT_ID),
  sampleTransaction('s2', TRANSFER, 'Retiro cajero', DEFAULT_CASH_ACCOUNT_ID, 300000, 2, SAVINGS_ACCOUNT_ID),
  sampleTransaction('s3', EXPENSE, 'Bus Pass', 'expenses-transport', 60000, 3),
  sampleTransaction('s4', EXPENSE, 'Electricity Bill', 'expenses-bills', 180000, 5),
  sampleTransaction('s5', EXPENSE, 'Zara', 'expenses-shopping', 189000, 8, CARD_ACCOUNT_ID),
  sampleTransaction('s6', EXPENSE, 'Helado', 'expenses-food', 15000, 10),
  sampleTransaction('s7', EXPENSE, 'Panadería', 'expenses-food', 28000, 12),
  sampleTransaction('s8', EXPENSE, 'Cita médica', 'expenses-health', 95000, 14),
  sampleTransaction('s9', EXPENSE, 'Restaurant', 'expenses-food', 85000, 15, CARD_ACCOUNT_ID),
  sampleTransaction('s10', EXPENSE, 'Carulla', 'expenses-food', 120000, 18),
  sampleTransaction('s11', EXPENSE, 'Rappi Order', 'expenses-food', 45000, 20, CARD_ACCOUNT_ID),
];

const sampleBudget = (
  id: string,
  accountId: string,
  majorLimit: number,
): Budget => ({
  id,
  accountId,
  monthlyLimit: toMinorUnits(majorLimit),
  createdAt: EPOCH,
  updatedAt: EPOCH,
});

export const SAMPLE_BUDGETS: Budget[] = [
  sampleBudget('b1', 'expenses-food', 600000),
  sampleBudget('b2', 'expenses-transport', 200000),
  sampleBudget('b3', 'expenses-shopping', 250000),
  sampleBudget('b4', 'expenses-bills', 2350000),
  sampleBudget('b5', 'expenses-health', 150000),
  sampleBudget('b6', 'expenses-others', 300000),
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
