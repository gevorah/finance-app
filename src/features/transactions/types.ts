import { ReactNode } from "react";
import { DateValue } from "react-aria-components";

export type TransactionType = 'income' | 'expense';
export type VariantType = 'primary' | 'secondary' | 'tertiary';

export interface Transaction {
  id: string;
  type: TransactionType;
  icon?: ReactNode;
  category: CATEGORY_TYPES;
  amount: number;
  date: DateValue;
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