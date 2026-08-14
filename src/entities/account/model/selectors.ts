import type { Transaction } from '@/entities/transaction';
import { Money } from '@/shared/lib/money';

import { Account, isRealAccount } from './types';

/**
 * An account's balance is nothing but the sum of its postings. There is no
 * stored balance to drift out of sync with the movements.
 */
export function getAccountBalance(
  account: Account,
  transactions: Transaction[],
): Money {
  return transactions.reduce(
    (total, transaction) =>
      total +
      transaction.postings
        .filter((posting) => posting.accountId === account.id)
        .reduce((sum, posting) => sum + posting.amount, 0),
    0,
  );
}

export function getRealAccounts(accounts: Account[]): Account[] {
  return accounts.filter(
    (account) => isRealAccount(account) && !account.archived,
  );
}

export function getTotalBalance(
  accounts: Account[],
  transactions: Transaction[],
): Money {
  return getRealAccounts(accounts).reduce(
    (total, account) => total + getAccountBalance(account, transactions),
    0,
  );
}

export function getOnBudgetBalance(
  accounts: Account[],
  transactions: Transaction[],
): Money {
  return getRealAccounts(accounts)
    .filter((account) => account.onBudget)
    .reduce(
      (total, account) => total + getAccountBalance(account, transactions),
      0,
    );
}

export function getAccountsByRoot(
  accounts: Account[],
  root: Account['root'],
): Account[] {
  return accounts.filter(
    (account) => account.root === root && !account.archived,
  );
}

export function getAccountName(accounts: Account[], id: string): string {
  return accounts.find((account) => account.id === id)?.name ?? 'Unknown';
}

export function indexAccounts(accounts: Account[]): Map<string, Account> {
  return new Map(accounts.map((account) => [account.id, account]));
}

export function getAccountPostingCount(
  accountId: string,
  transactions: Transaction[],
): number {
  return transactions.reduce(
    (count, transaction) =>
      count +
      transaction.postings.filter(
        (posting) => posting.accountId === accountId,
      ).length,
    0,
  );
}

export function canDeleteAccount(
  accountId: string,
  transactions: Transaction[],
): boolean {
  return getAccountPostingCount(accountId, transactions) === 0;
}
