import { Money } from '@/shared/lib/money';

export interface Budget {
  id: string;
  accountId: string;
  monthlyLimit: Money;
  createdAt: string;
  updatedAt: string;
}

export type BudgetInput = Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>;
