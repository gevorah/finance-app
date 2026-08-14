import {
  Account,
  AccountInput,
  ACCOUNT_TYPES,
  DEFAULT_ACCOUNT_ID,
} from '@/entities/account';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AccountStore {
  accounts: Account[];
  addAccount: (account: AccountInput) => void;
  updateAccount: (id: string, changes: Partial<AccountInput>) => void;
  archiveAccount: (id: string) => void;
  deleteAccount: (id: string) => void;
}

const defaultAccount: Account = {
  id: DEFAULT_ACCOUNT_ID,
  name: 'Cash',
  type: ACCOUNT_TYPES.CASH,
  initialBalance: 0,
  onBudget: true,
  archived: false,
  createdAt: '1970-01-01T00:00:00.000Z',
  updatedAt: '1970-01-01T00:00:00.000Z',
};

export const useAccountStore = create<AccountStore>()(
  persist(
    (set) => ({
      accounts: [defaultAccount],

      addAccount: (account) =>
        set((state) => {
          const now = new Date().toISOString();
          return {
            accounts: [
              ...state.accounts,
              {
                ...account,
                id: crypto.randomUUID(),
                archived: false,
                createdAt: now,
                updatedAt: now,
              },
            ],
          };
        }),

      updateAccount: (id, changes) =>
        set((state) => ({
          accounts: state.accounts.map((account) =>
            account.id === id
              ? { ...account, ...changes, updatedAt: new Date().toISOString() }
              : account,
          ),
        })),

      archiveAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.map((account) =>
            account.id === id
              ? { ...account, archived: true, updatedAt: new Date().toISOString() }
              : account,
          ),
        })),

      deleteAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((account) => account.id !== id),
        })),
    }),
    {
      name: 'account-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
