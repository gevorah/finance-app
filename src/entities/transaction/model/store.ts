import { Transaction, TransactionInput } from './types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { migrateTransactionsToV1 } from './migrations';

interface TransactionStore {
  transactions: Transaction[];
  addTransaction: (transaction: TransactionInput) => void;
  updateTransaction: (id: string, changes: Partial<TransactionInput>) => void;
  deleteTransaction: (id: string) => void;
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set) => ({
      transactions: [],

      addTransaction: (transaction) =>
        set((state) => {
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
          transactions: state.transactions.map((t) =>
            t.id === id
              ? { ...t, ...changes, updatedAt: new Date().toISOString() }
              : t,
          ),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),
    }),
    {
      name: 'transaction-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted, version) =>
        version >= 1
          ? (persisted as { transactions: Transaction[] })
          : migrateTransactionsToV1(persisted),
    },
  ),
);
