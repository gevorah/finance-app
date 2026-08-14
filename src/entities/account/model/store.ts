import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_CHART_OF_ACCOUNTS } from './chart';
import { indexAccounts } from './selectors';
import { Account, AccountInput } from './types';

interface AccountStore {
  accounts: Account[];
  /** Returns the new account id so callers can post its opening balance. */
  addAccount: (account: AccountInput) => string;
  updateAccount: (id: string, changes: Partial<AccountInput>) => void;
  archiveAccount: (id: string) => void;
  deleteAccount: (id: string) => void;
}

export const useAccountStore = create<AccountStore>()(
  persist(
    (set) => ({
      accounts: DEFAULT_CHART_OF_ACCOUNTS,

      addAccount: (account) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        set((state) => ({
          accounts: [
            ...state.accounts,
            { ...account, id, archived: false, createdAt: now, updatedAt: now },
          ],
        }));

        return id;
      },

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
              ? {
                  ...account,
                  archived: true,
                  updatedAt: new Date().toISOString(),
                }
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
      version: 3,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function useAccountsById(): Map<string, Account> {
  const accounts = useAccountStore((state) => state.accounts);
  return useMemo(() => indexAccounts(accounts), [accounts]);
}
