import { Money } from '@/shared/lib/money';

export const ACCOUNT_TYPES = {
  CASH: 'cash',
  CHECKING: 'checking',
  SAVINGS: 'savings',
  CREDIT_CARD: 'credit_card',
} as const;

export type AccountType = (typeof ACCOUNT_TYPES)[keyof typeof ACCOUNT_TYPES];

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: Money;
  onBudget: boolean;
  creditLimit?: Money;
  cutOffDay?: number;
  paymentDueDay?: number;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AccountInput = Omit<
  Account,
  'id' | 'archived' | 'createdAt' | 'updatedAt'
>;

export const DEFAULT_ACCOUNT_ID = 'cash';

export const ACCOUNT_TYPE_OPTIONS = [
  { id: ACCOUNT_TYPES.CASH, label: 'Cash' },
  { id: ACCOUNT_TYPES.CHECKING, label: 'Checking' },
  { id: ACCOUNT_TYPES.SAVINGS, label: 'Savings' },
  { id: ACCOUNT_TYPES.CREDIT_CARD, label: 'Credit card' },
] as const;

export function isCreditAccount(account: Account): boolean {
  return account.type === ACCOUNT_TYPES.CREDIT_CARD;
}
