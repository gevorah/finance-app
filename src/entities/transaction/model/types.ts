import { CategoryType } from '@/entities/category';
import { Money } from '@/shared/lib/money';

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  type: TransactionType;
  accountId: string;
  transferAccountId?: string;
  category?: CategoryType;
  amount: Money;
  date: string;
  description: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionInput = Omit<
  Transaction,
  'id' | 'createdAt' | 'updatedAt'
>;

export function isTransfer(transaction: Transaction): boolean {
  return transaction.type === 'transfer';
}
