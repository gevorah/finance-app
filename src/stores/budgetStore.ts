import { Budget, BudgetInput } from '@/entities/budget';
import { CATEGORY_TYPES } from '@/entities/category';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface BudgetStore {
  budget: Budget[];
  addBudget: (budget: BudgetInput) => void;
  updateBudget: (id: string, updatedBudget: BudgetInput) => void;
  deleteBudget: (id: string) => void;
}
export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set) => ({
      budget: [
        {
          id: '1',
          category: CATEGORY_TYPES.FOOD,
          monthlyLimit: 600000,
          createdAt: '2026-06-01T10:00:00.000Z',
          updatedAt: '2026-06-20T10:00:00.000Z',
        },
        {
          id: '2',
          category: CATEGORY_TYPES.TRANSPORT,
          monthlyLimit: 200000,
          createdAt: '2026-06-01T10:00:00.000Z',
          updatedAt: '2026-06-18T10:00:00.000Z',
        },
        {
          id: '3',
          category: CATEGORY_TYPES.SHOPPING,
          monthlyLimit: 250000,
          createdAt: '2026-06-01T10:00:00.000Z',
          updatedAt: '2026-06-22T10:00:00.000Z',
        },
        {
          id: '4',
          category: CATEGORY_TYPES.BILLS,
          monthlyLimit: 2350000,
          createdAt: '2026-06-01T10:00:00.000Z',
          updatedAt: '2026-06-15T10:00:00.000Z',
        },
        {
          id: '5',
          category: CATEGORY_TYPES.HEALTH,
          monthlyLimit: 150000,
          createdAt: '2026-06-01T10:00:00.000Z',
          updatedAt: '2026-06-10T10:00:00.000Z',
        },
        {
          id: '6',
          category: CATEGORY_TYPES.OTHERS,
          monthlyLimit: 300000,
          createdAt: '2026-06-01T10:00:00.000Z',
          updatedAt: '2026-06-12T10:00:00.000Z',
        },
      ],
      addBudget(budget: BudgetInput) {
        set((state) => ({
          budget: [
            ...state.budget,
            {
              ...budget,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        }));
      },
      updateBudget(id: string, updatedBudget: BudgetInput) {
        set((state) => ({
          budget: state.budget.map((b) =>
            b.id === id
              ? { ...b, ...updatedBudget, updatedAt: new Date().toISOString() }
              : b,
          ),
        }));
      },
      deleteBudget(id: string) {
        set((state) => ({
          budget: state.budget.filter((b) => b.id !== id),
        }));
      },
    }),
    {
      name: 'budget-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
