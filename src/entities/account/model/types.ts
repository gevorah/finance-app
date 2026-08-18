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

export const ACCOUNT_KIND_LABELS: Record<AccountKind, string> = {
  [ACCOUNT_KINDS.CASH]: 'Cash',
  [ACCOUNT_KINDS.CHECKING]: 'Checking',
  [ACCOUNT_KINDS.SAVINGS]: 'Savings',
  [ACCOUNT_KINDS.CREDIT_CARD]: 'Credit card',
  [ACCOUNT_KINDS.LOAN]: 'Loan',
  [ACCOUNT_KINDS.MORTGAGE]: 'Mortgage',
  [ACCOUNT_KINDS.VEHICLE]: 'Vehicle',
  [ACCOUNT_KINDS.STUDENT]: 'Student',
  [ACCOUNT_KINDS.PERSONAL]: 'Personal',
};

export const ASSET_KINDS: AccountKind[] = [
  ACCOUNT_KINDS.CASH,
  ACCOUNT_KINDS.CHECKING,
  ACCOUNT_KINDS.SAVINGS,
];

export const LIABILITY_KINDS: AccountKind[] = [
  ACCOUNT_KINDS.CREDIT_CARD,
  ACCOUNT_KINDS.LOAN,
  ACCOUNT_KINDS.MORTGAGE,
  ACCOUNT_KINDS.VEHICLE,
  ACCOUNT_KINDS.STUDENT,
  ACCOUNT_KINDS.PERSONAL,
];

export function getRootForKind(kind: AccountKind): AccountRoot {
  return LIABILITY_KINDS.includes(kind)
    ? ACCOUNT_ROOTS.LIABILITIES
    : ACCOUNT_ROOTS.ASSETS;
}

const toKindOption = (id: AccountKind) => ({
  id,
  label: ACCOUNT_KIND_LABELS[id],
});

export const ACCOUNT_KIND_OPTIONS = ASSET_KINDS.map(toKindOption);
export const LIABILITY_KIND_OPTIONS = LIABILITY_KINDS.map(toKindOption);

/** A credit card revolves; everything else that is owed is paid in installments. */
export const LIABILITY_KIND_TO_PAYMENT_TYPE: Record<string, string> = {
  [ACCOUNT_KINDS.CREDIT_CARD]: 'revolving',
  [ACCOUNT_KINDS.LOAN]: 'installments',
  [ACCOUNT_KINDS.MORTGAGE]: 'installments',
  [ACCOUNT_KINDS.VEHICLE]: 'installments',
  [ACCOUNT_KINDS.STUDENT]: 'installments',
  [ACCOUNT_KINDS.PERSONAL]: 'flexible',
};
