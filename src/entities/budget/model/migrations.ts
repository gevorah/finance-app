import { migrateLegacyCategory } from '@/entities/category';
import { readPersistedList, readPersistedMoney } from '@/shared/lib/persist';

import { Budget } from './types';

export function migrateBudgetsToV1(persisted: unknown): { budgets: Budget[] } {
  const budgets = readPersistedList(persisted, 'budget').map((entry) => ({
    id: String(entry.id),
    category: migrateLegacyCategory(entry.category),
    monthlyLimit: readPersistedMoney(entry.monthlyLimit),
    createdAt: String(entry.createdAt ?? new Date().toISOString()),
    updatedAt: String(entry.updatedAt ?? new Date().toISOString()),
  }));

  return { budgets };
}
