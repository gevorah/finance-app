import { CATEGORY_TYPES } from '@/entities/category';
import { Transaction, TransactionInput } from '@/entities/transaction';
import { CalendarDate } from '@internationalized/date';
import { create } from 'zustand';

interface TransactionStore {
  transactions: Transaction[];
  addTransaction: (transaction: TransactionInput) => void;
  updateTransaction: (id: string, changes: Partial<TransactionInput>) => void;
  deleteTransaction: (id: string) => void;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [
    {
      id: '1',
      type: 'expense',
      description: 'Grocery Shopping',
      category: CATEGORY_TYPES.FOOD,
      amount: 45.5,
      date: new CalendarDate(2026, 4, 10).toString(),
      createdAt: '2026-04-10T10:00:00.000Z',
      updatedAt: '2026-04-10T10:00:00.000Z',
    },
    {
      id: '2',
      type: 'income',
      description: 'Monthly Salary',
      category: CATEGORY_TYPES.INCOME,
      amount: 3000,
      date: new CalendarDate(2026, 4, 1).toString(),
      createdAt: '2026-04-01T08:00:00.000Z',
      updatedAt: '2026-04-01T08:00:00.000Z',
    },
    {
      id: '3',
      type: 'expense',
      description: 'Electricity Bill',
      category: CATEGORY_TYPES.BILLS,
      amount: 120,
      date: new CalendarDate(2026, 4, 5).toString(),
      createdAt: '2026-04-05T09:00:00.000Z',
      updatedAt: '2026-04-05T09:00:00.000Z',
    },
    {
      id: '4',
      type: 'expense',
      description: 'Bus Pass',
      category: CATEGORY_TYPES.TRANSPORT,
      amount: 60,
      date: new CalendarDate(2026, 4, 3).toString(),
      createdAt: '2026-04-03T07:30:00.000Z',
      updatedAt: '2026-04-03T07:30:00.000Z',
    },
    {
      id: '5',
      type: 'expense',
      description: 'New Headphones',
      category: CATEGORY_TYPES.SHOPPING,
      amount: 89.99,
      date: new CalendarDate(2026, 4, 8).toString(),
      createdAt: '2026-04-08T15:00:00.000Z',
      updatedAt: '2026-04-08T15:00:00.000Z',
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
}));
