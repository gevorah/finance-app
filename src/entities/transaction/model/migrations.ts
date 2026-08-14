import { DEFAULT_ACCOUNT_ID } from '@/entities/account';
import { migrateLegacyCategory } from '@/entities/category';
import { readPersistedList, readPersistedMoney } from '@/shared/lib/persist';

import { Transaction, TransactionType } from './types';

export function migrateTransactionsToV1(persisted: unknown): {
  transactions: Transaction[];
} {
  const transactions = readPersistedList(persisted, 'transactions').map(
    (entry) => ({
      id: String(entry.id),
      type: entry.type as TransactionType,
      accountId: DEFAULT_ACCOUNT_ID,
      category: migrateLegacyCategory(entry.category),
      amount: readPersistedMoney(entry.amount),
      date: String(entry.date),
      description: String(entry.description ?? ''),
      createdAt: String(entry.createdAt ?? new Date().toISOString()),
      updatedAt: String(entry.updatedAt ?? new Date().toISOString()),
    }),
  );

  return { transactions };
}
