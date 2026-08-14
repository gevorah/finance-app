import { CategoryType } from '@/entities/category';
import { Money } from '@/shared/lib/money';

export interface Budget {
  id: string;
  category: CategoryType;
  monthlyLimit: Money;
  createdAt: string;
  updatedAt: string;
}

export type BudgetInput = Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>;
