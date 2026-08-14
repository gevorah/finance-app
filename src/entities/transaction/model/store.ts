import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { isBalanced } from './ledger';
import {
  legacyDebtsToOpeningBalances,
  readLegacyDebtStorage,
} from '@/entities/account';

import { buildDebtOpeningBalances, migrateTransactionsToV2 } from './migrations';
import { Transaction, TransactionInput } from './types';

interface TransactionStore {
  transactions: Transaction[];
  addTransaction: (transaction: TransactionInput) => void;
  updateTransaction: (id: string, changes: Partial<TransactionInput>) => void;
  deleteTransaction: (id: string) => void;
}

/**
 * Postings that do not sum to zero would silently corrupt every balance, so an
 * unbalanced write is rejected at the door rather than stored.
 */
function assertBalanced(transaction: TransactionInput | Transaction): void {
  if (!isBalanced(transaction.postings)) {
    throw new Error(
      `Unbalanced transaction "${transaction.description}": postings must sum to zero.`,
    );
  }
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set) => ({
      transactions: [],

      addTransaction: (transaction) =>
        set((state) => {
          assertBalanced(transaction);
          const now = new Date().toISOString();
          return {
            transactions: [
              ...state.transactions,
              {
                ...transaction,
                id: crypto.randomUUID(),
                createdAt: now,
                updatedAt: now,
              },
            ],
          };
        }),

      updateTransaction: (id, changes) =>
        set((state) => ({
          transactions: state.transactions.map((t) => {
            if (t.id !== id) return t;
            const updated = {
              ...t,
              ...changes,
              updatedAt: new Date().toISOString(),
            };
            assertBalanced(updated);
            return updated;
          }),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),
    }),
    {
      name: 'transaction-storage',
      version: 3,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted, version) => {
        const base =
          version >= 2
            ? (persisted as { transactions: Transaction[] })
            : migrateTransactionsToV2(persisted);

        if (version >= 3) return base;

        return {
          transactions: [
            ...base.transactions,
            ...buildDebtOpeningBalances(
              legacyDebtsToOpeningBalances(readLegacyDebtStorage()),
              new Date().toISOString().slice(0, 10),
            ),
          ],
        };
      },
    },
  ),
);
