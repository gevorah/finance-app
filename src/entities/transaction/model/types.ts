import { Money } from '@/shared/lib/money';

export interface Posting {
  accountId: string;
  amount: Money;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  payee?: string;
  notes?: string;
  postings: Posting[];
  createdAt: string;
  updatedAt: string;
}

export type TransactionInput = Omit<
  Transaction,
  'id' | 'createdAt' | 'updatedAt'
>;

export const TRANSACTION_KINDS = {
  EXPENSE: 'expense',
  INCOME: 'income',
  TRANSFER: 'transfer',
  OPENING: 'opening',
} as const;

export type TransactionKind =
  (typeof TRANSACTION_KINDS)[keyof typeof TRANSACTION_KINDS];
