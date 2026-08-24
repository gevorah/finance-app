import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { assertBalanced } from './ledger';
import { Transaction, TransactionInput } from './types';

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
    },
  ),
);
