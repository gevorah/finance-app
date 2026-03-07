import { ReactNode } from "react";

export type TransactionType = 'income' | 'expense';
export type VariantType = 'primary' | 'secondary' | 'tertiary';

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  icon?: ReactNode;
  category: CATEGORY_TYPES;
  amount: number;
  date: string;
  description?: string;
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