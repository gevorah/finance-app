import { ReactNode } from 'react';
import { CategoryType } from '@/entities/category';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  icon?: ReactNode;
  category: CategoryType;
  amount: number;
  date: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
