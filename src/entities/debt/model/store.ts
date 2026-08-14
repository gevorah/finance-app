import type {
  Debt,
  DebtInput,
  DebtPaymentTerms,
  DebtStatus,
} from './types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { migrateDebtsToV1 } from './migrations';

interface DebtStore {
  debts: Debt[];

  addDebt: (debt: DebtInput) => void;
  updateDebt: (id: string, changes: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  markAsPaid: (id: string) => void;
}

export const getDebtStatus = (debt: {
  currentBalance: number;
  paidOffDate?: string;
  paymentTerms: DebtPaymentTerms;
}): DebtStatus => {
  if (debt.currentBalance <= 0 || debt.paidOffDate) {
    return 'paid_off';
  }

  const nextPaymentDueDate = debt.paymentTerms.nextPaymentDueDate;

  if (nextPaymentDueDate && new Date(nextPaymentDueDate) < new Date()) {
    return 'late';
  }

  return 'current';
};

export const useDebtStore = create<DebtStore>()(
  persist(
    (set) => ({
      debts: [],

      addDebt: (debt) =>
        set((state) => {
          const now = new Date().toISOString();
          const currentBalance = debt.currentBalance ?? debt.originalAmount;

          const highestPriority = state.debts.reduce(
            (max, current) => Math.max(max, current.priority ?? 0),
            0,
          );
          const priority = Math.min(highestPriority + 1, 5);

          const newDebt: Debt = {
            ...debt,
            id: crypto.randomUUID(),
            currentBalance,
            priority,
            status: getDebtStatus({ ...debt, currentBalance }),
            createdAt: now,
            updatedAt: now,
          };

          return {
            debts: [...state.debts, newDebt],
          };
        }),

      updateDebt: (id, changes) =>
        set((state) => ({
          debts: state.debts.map((debt) =>
            debt.id === id
              ? {
                  ...debt,
                  ...changes,
                  updatedAt: new Date().toISOString(),
                }
              : debt,
          ),
        })),

      deleteDebt: (id) =>
        set((state) => ({
          debts: state.debts.filter((debt) => debt.id !== id),
        })),

      markAsPaid: (id) =>
        set((state) => ({
          debts: state.debts.map((debt) =>
            debt.id === id
              ? {
                  ...debt,
                  currentBalance: 0,
                  paidOffDate: new Date().toISOString(),
                  status: 'paid_off',
                  updatedAt: new Date().toISOString(),
                }
              : debt,
          ),
        })),
    }),
    {
      name: 'debt-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted, version) =>
        version >= 1
          ? (persisted as { debts: Debt[] })
          : migrateDebtsToV1(persisted),
    },
  ),
);
