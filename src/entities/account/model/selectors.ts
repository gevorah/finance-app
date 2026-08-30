import type { Transaction } from '@/entities/transaction';
import { Money } from '@/shared/lib/money';

import {
  ACCOUNT_ROOTS,
  AccountCore,
  AccountRoot,
  isRealAccount,
} from './types';

/**
 * An account's balance is nothing but the sum of its postings. There is no
 * stored balance to drift out of sync with the movements.
 */
export function getAccountBalance(
  account: AccountCore,
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

export function getRealAccounts<T extends AccountCore>(accounts: T[]): T[] {
  return accounts.filter(
    (account) => isRealAccount(account) && !account.archived,
  );
}

export function getTotalBalance(
  accounts: AccountCore[],
  transactions: Transaction[],
): Money {
  return getRealAccounts(accounts).reduce(
    (total, account) => total + getAccountBalance(account, transactions),
    0,
  );
}

function sumGroup(
  accounts: AccountCore[],
  transactions: Transaction[],
  root: AccountRoot,
  onBudget: boolean,
): Money {
  return getRealAccounts(accounts)
    .filter((account) => account.root === root && account.onBudget === onBudget)
    .reduce(
      (total, account) => total + getAccountBalance(account, transactions),
      0,
    );
}

/**
 * The four figures classify both sides of the ledger by the same timeframe, so
 * what is held this month can be read against what falls due in it. Reporting
 * only one side classified would hide a card behind a mortgage. None of them
 * clamps: together they always add back up to the sum of every posting.
 */
export function getAvailableBalance(
  accounts: AccountCore[],
  transactions: Transaction[],
): Money {
  return sumGroup(accounts, transactions, ACCOUNT_ROOTS.ASSETS, true);
}

export function getSetAsideBalance(
  accounts: AccountCore[],
  transactions: Transaction[],
): Money {
  return sumGroup(accounts, transactions, ACCOUNT_ROOTS.ASSETS, false);
}

export function getDueNowBalance(
  accounts: AccountCore[],
  transactions: Transaction[],
): Money {
  return -sumGroup(accounts, transactions, ACCOUNT_ROOTS.LIABILITIES, true);
}

export function getLongTermBalance(
  accounts: AccountCore[],
  transactions: Transaction[],
): Money {
  return -sumGroup(accounts, transactions, ACCOUNT_ROOTS.LIABILITIES, false);
}

export function getAccountsByRoot<T extends AccountCore>(
  accounts: T[],
  root: AccountRoot,
): T[] {
  return accounts.filter(
    (account) => account.root === root && !account.archived,
  );
}

export function getAccountName(accounts: AccountCore[], id: string): string {
  return accounts.find((account) => account.id === id)?.name ?? 'Unknown';
}

export function indexAccounts<T extends AccountCore>(
  accounts: T[],
): Map<string, T> {
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
