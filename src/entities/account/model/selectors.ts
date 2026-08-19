import type { Transaction } from '@/entities/transaction';
import { Money } from '@/shared/lib/money';

import { Account, ACCOUNT_ROOTS, isRealAccount } from './types';

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

function sumAssets(
  accounts: Account[],
  transactions: Transaction[],
  onBudget: boolean,
): Money {
  return getRealAccounts(accounts)
    .filter(
      (account) =>
        account.root === ACCOUNT_ROOTS.ASSETS && account.onBudget === onBudget,
    )
    .reduce(
      (total, account) => total + getAccountBalance(account, transactions),
      0,
    );
}

/**
 * What can be spent is money actually held, not a net position: subtracting a
 * card without a category holding the money to repay it would report a figure
 * nobody can act on. What is owed is reported on its own.
 */
export function getAvailableBalance(
  accounts: Account[],
  transactions: Transaction[],
): Money {
  return sumAssets(accounts, transactions, true);
}

export function getSetAsideBalance(
  accounts: Account[],
  transactions: Transaction[],
): Money {
  return sumAssets(accounts, transactions, false);
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
      transaction.postings.filter((posting) => posting.accountId === accountId)
        .length,
    0,
  );
}

export function canDeleteAccount(
  accountId: string,
  transactions: Transaction[],
): boolean {
  return getAccountPostingCount(accountId, transactions) === 0;
}
