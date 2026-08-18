import { Money } from '@/shared/lib/money';

import { DebtTerms } from './debt-terms';

export const ACCOUNT_ROOTS = {
  ASSETS: 'assets',
  LIABILITIES: 'liabilities',
  EQUITY: 'equity',
  INCOME: 'income',
  EXPENSES: 'expenses',
} as const;

export type AccountRoot = (typeof ACCOUNT_ROOTS)[keyof typeof ACCOUNT_ROOTS];

export const ACCOUNT_KINDS = {
  CASH: 'cash',
  CHECKING: 'checking',
  SAVINGS: 'savings',
  CREDIT_CARD: 'credit_card',
  LOAN: 'loan',
  MORTGAGE: 'mortgage',
  VEHICLE: 'vehicle',
  STUDENT: 'student',
  PERSONAL: 'personal',
} as const;

export type AccountKind = (typeof ACCOUNT_KINDS)[keyof typeof ACCOUNT_KINDS];

export interface Account {
  id: string;
  name: string;
  root: AccountRoot;
  kind?: AccountKind;
  onBudget: boolean;
  creditLimit?: Money;
  cutOffDay?: number;
  paymentDueDay?: number;
  description?: string;
  /** Only on liability accounts. */
  debtTerms?: DebtTerms;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AccountInput = Omit<
  Account,
  'id' | 'archived' | 'createdAt' | 'updatedAt'
>;

export const OPENING_BALANCE_ACCOUNT_ID = 'equity-opening-balances';
export const DEFAULT_CASH_ACCOUNT_ID = 'assets-cash';
export const UNCATEGORIZED_EXPENSE_ACCOUNT_ID = 'expenses-others';
export const DEFAULT_INCOME_ACCOUNT_ID = 'income-salary';

export function isRealAccount(account: Account): boolean {
  return (
    account.root === ACCOUNT_ROOTS.ASSETS ||
    account.root === ACCOUNT_ROOTS.LIABILITIES
  );
}

export function isCategoryAccount(account: Account): boolean {
  return (
    account.root === ACCOUNT_ROOTS.INCOME ||
    account.root === ACCOUNT_ROOTS.EXPENSES
  );
}

export function isCreditAccount(account: Account): boolean {
  return account.kind === ACCOUNT_KINDS.CREDIT_CARD;
}

export const ACCOUNT_KIND_OPTIONS = [
  { id: ACCOUNT_KINDS.CASH, label: 'Cash' },
  { id: ACCOUNT_KINDS.CHECKING, label: 'Checking' },
  { id: ACCOUNT_KINDS.SAVINGS, label: 'Savings' },
] as const;

export const LIABILITY_KIND_OPTIONS = [
  { id: ACCOUNT_KINDS.CREDIT_CARD, label: 'Credit card' },
  { id: ACCOUNT_KINDS.LOAN, label: 'Loan' },
  { id: ACCOUNT_KINDS.MORTGAGE, label: 'Mortgage' },
  { id: ACCOUNT_KINDS.VEHICLE, label: 'Vehicle' },
  { id: ACCOUNT_KINDS.STUDENT, label: 'Student' },
  { id: ACCOUNT_KINDS.PERSONAL, label: 'Personal' },
] as const;

/** A credit card revolves; everything else that is owed is paid in installments. */
export const LIABILITY_KIND_TO_PAYMENT_TYPE: Record<string, string> = {
  [ACCOUNT_KINDS.CREDIT_CARD]: 'revolving',
  [ACCOUNT_KINDS.LOAN]: 'installments',
  [ACCOUNT_KINDS.MORTGAGE]: 'installments',
  [ACCOUNT_KINDS.VEHICLE]: 'installments',
  [ACCOUNT_KINDS.STUDENT]: 'installments',
  [ACCOUNT_KINDS.PERSONAL]: 'flexible',
};
