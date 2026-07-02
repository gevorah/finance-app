import { CATEGORY_TYPES } from '@/entities/category';
import { Transaction, TransactionInput } from '@/entities/transaction';
import { CalendarDate } from '@internationalized/date';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface TransactionStore {
  transactions: Transaction[];
  addTransaction: (transaction: TransactionInput) => void;
  updateTransaction: (id: string, changes: Partial<TransactionInput>) => void;
  deleteTransaction: (id: string) => void;
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set) => ({
      transactions: [
        {
          id: '1',
          type: 'expense',
          description: 'Rappi Order',
          category: CATEGORY_TYPES.FOOD,
          amount: 45000,
          date: new CalendarDate(2026, 6, 20).toString(),
          createdAt: '2026-06-20T12:00:00.000Z',
          updatedAt: '2026-06-20T12:00:00.000Z',
        },
        {
          id: '2',
          type: 'expense',
          description: 'Carulla',
          category: CATEGORY_TYPES.FOOD,
          amount: 120000,
          date: new CalendarDate(2026, 6, 18).toString(),
          createdAt: '2026-06-18T10:00:00.000Z',
          updatedAt: '2026-06-18T10:00:00.000Z',
        },
        {
          id: '3',
          type: 'expense',
          description: 'Restaurant',
          category: CATEGORY_TYPES.FOOD,
          amount: 85000,
          date: new CalendarDate(2026, 6, 15).toString(),
          createdAt: '2026-06-15T20:00:00.000Z',
          updatedAt: '2026-06-15T20:00:00.000Z',
        },
        {
          id: '4',
          type: 'expense',
          description: 'Panadería',
          category: CATEGORY_TYPES.FOOD,
          amount: 28000,
          date: new CalendarDate(2026, 6, 12).toString(),
          createdAt: '2026-06-12T08:00:00.000Z',
          updatedAt: '2026-06-12T08:00:00.000Z',
        },
        {
          id: '5',
          type: 'expense',
          description: 'Helado',
          category: CATEGORY_TYPES.FOOD,
          amount: 15000,
          date: new CalendarDate(2026, 6, 10).toString(),
          createdAt: '2026-06-10T16:00:00.000Z',
          updatedAt: '2026-06-10T16:00:00.000Z',
        },
        {
          id: '6',
          type: 'income',
          description: 'Monthly Salary',
          category: CATEGORY_TYPES.INCOME,
          amount: 4500000,
          date: new CalendarDate(2026, 6, 1).toString(),
          createdAt: '2026-06-01T08:00:00.000Z',
          updatedAt: '2026-06-01T08:00:00.000Z',
        },
        {
          id: '7',
          type: 'expense',
          description: 'Electricity Bill',
          category: CATEGORY_TYPES.BILLS,
          amount: 180000,
          date: new CalendarDate(2026, 6, 5).toString(),
          createdAt: '2026-06-05T09:00:00.000Z',
          updatedAt: '2026-06-05T09:00:00.000Z',
        },
        {
          id: '8',
          type: 'expense',
          description: 'Bus Pass',
          category: CATEGORY_TYPES.TRANSPORT,
          amount: 60000,
          date: new CalendarDate(2026, 6, 3).toString(),
          createdAt: '2026-06-03T07:30:00.000Z',
          updatedAt: '2026-06-03T07:30:00.000Z',
        },
        {
          id: '9',
          type: 'expense',
          description: 'Zara',
          category: CATEGORY_TYPES.SHOPPING,
          amount: 189000,
          date: new CalendarDate(2026, 6, 8).toString(),
          createdAt: '2026-06-08T15:00:00.000Z',
          updatedAt: '2026-06-08T15:00:00.000Z',
        },
        {
          id: '10',
          type: 'expense',
          description: 'Cita médica',
          category: CATEGORY_TYPES.HEALTH,
          amount: 95000,
          date: new CalendarDate(2026, 6, 14).toString(),
          createdAt: '2026-06-14T10:00:00.000Z',
          updatedAt: '2026-06-14T10:00:00.000Z',
        },
      ],
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [
            ...state.transactions,
            {
              ...transaction,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),
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
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
