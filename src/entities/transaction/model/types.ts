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

export enum CATEGORY_TYPES{
  Food= "Food & Drinks",
  Bills= "Bills",
  Income= "Income",
  Shopping= "Shopping",
  Health= "Health",
  Transport= "Transport",
  Others= "Others"
}