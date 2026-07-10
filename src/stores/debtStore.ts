import type {
  Debt,
  DebtInput,
  DebtPaymentTerms,
  DebtStatus,
} from '@/entities/debt';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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
      debts: [
        {
          id: '1',
          creditorName: 'Bancolombia',
          type: 'loan',
          originalAmount: 30000000,
          currentBalance: 22000000,
          interest: {
            type: 'fixed',
            rate: 1.8,
            period: 'monthly',
          },
          paymentTerms: {
            type: 'installments',
            installmentAmount: 1219706,
            totalInstallments: 36,
            paidInstallments: 10,
            frequency: 'monthly',
            nextPaymentDueDate: '2026-07-15',
          },
          startDate: '2025-09-01',
          description: 'Crédito libre inversión',
          priority: 1,
          status: 'current',
          createdAt: '2026-06-20T10:00:00.000Z',
          updatedAt: '2026-06-20T10:00:00.000Z',
        },
        {
          id: '2',
          creditorName: 'RappiCard',
          type: 'credit_card',
          originalAmount: 1000000,
          currentBalance: 850000,
          interest: {
            type: 'fixed',
            rate: 2.1,
            period: 'monthly',
          },
          paymentTerms: {
            type: 'revolving',
            minimumPayment: 95000,
            statementBalance: 850000,
            cutOffDay: 5,
            nextPaymentDueDate: '2026-07-20',
          },
          startDate: '2026-06-01',
          description: 'Tarjeta de crédito',
          priority: 2,
          status: 'current',
          createdAt: '2026-06-18T10:00:00.000Z',
          updatedAt: '2026-06-18T10:00:00.000Z',
        },
      ],

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
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
