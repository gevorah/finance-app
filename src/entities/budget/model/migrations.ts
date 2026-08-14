import { UNCATEGORIZED_EXPENSE_ACCOUNT_ID } from '@/entities/account';
import { readPersistedList } from '@/shared/lib/persist';

import { Budget } from './types';

const LEGACY_CATEGORY_ACCOUNTS: Record<string, string> = {
  food: 'expenses-food',
  bills: 'expenses-bills',
  shopping: 'expenses-shopping',
  health: 'expenses-health',
  transport: 'expenses-transport',
  others: UNCATEGORIZED_EXPENSE_ACCOUNT_ID,
};

export function migrateBudgetsToV2(persisted: unknown): { budgets: Budget[] } {
  const budgets = readPersistedList(persisted, 'budgets').map((entry) => ({
    id: String(entry.id),
    accountId:
      LEGACY_CATEGORY_ACCOUNTS[String(entry.category)] ??
      UNCATEGORIZED_EXPENSE_ACCOUNT_ID,
    monthlyLimit: Number(entry.monthlyLimit) || 0,
    createdAt: String(entry.createdAt ?? new Date().toISOString()),
    updatedAt: String(entry.updatedAt ?? new Date().toISOString()),
  }));

  return { budgets };
}
