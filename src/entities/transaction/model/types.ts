import { ReactNode } from 'react';
import { CategoryType } from '@/entities/category';
import { PaymentMethod } from '@/entities/payment';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  icon?: ReactNode;
  category: CategoryType;
  notes?: string;
  amount: number;
  date: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  paymentMethod?: PaymentMethod;
}
