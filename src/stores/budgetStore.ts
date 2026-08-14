import { Budget, BudgetInput } from '@/entities/budget';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { migrateBudgetsToV1 } from './migrations';

interface BudgetStore {
  budgets: Budget[];
  addBudget: (budget: BudgetInput) => void;
  updateBudget: (id: string, changes: Partial<BudgetInput>) => void;
  deleteBudget: (id: string) => void;
}

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set) => ({
      budgets: [],

      addBudget: (budget) =>
        set((state) => {
          const now = new Date().toISOString();
          return {
            budgets: [
              ...state.budgets,
              {
                ...budget,
                id: crypto.randomUUID(),
                createdAt: now,
                updatedAt: now,
              },
            ],
          };
        }),

      updateBudget: (id, changes) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === id
              ? { ...b, ...changes, updatedAt: new Date().toISOString() }
              : b,
          ),
        })),

      deleteBudget: (id) =>
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        })),
    }),
    {
      name: 'budget-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted, version) =>
        version >= 1
          ? (persisted as { budgets: Budget[] })
          : migrateBudgetsToV1(persisted),
    },
  ),
);
