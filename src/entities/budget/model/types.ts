import { CategoryType } from "@/entities/category";

export interface Budget {
    id: string;
    category:CategoryType;
    monthlyLimit: number;
    createdAt: string;
    updatedAt: string;
}

export type BudgetInput=Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>

export const PERIOD_VALUES={
    MONTHLY: 'monthly',
    WEEKLY: 'weekly',
    BIWEEKLY: 'bi-weekly',
} as const;

export type PeriodOptions= (typeof PERIOD_VALUES)[keyof typeof PERIOD_VALUES];

export const PERIOD_OPTIONS = [
    { id: 'monthly', label: 'Monthly' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'bi-weekly', label: 'Bi-weekly' },
] as const;