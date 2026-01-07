export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
