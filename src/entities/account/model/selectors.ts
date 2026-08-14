import type { Transaction } from '@/entities/transaction';
import { Money } from '@/shared/lib/money';

import { Account } from './types';

export function getAccountBalance(
  account: Account,
  transactions: Transaction[],
): Money {
  return transactions.reduce((balance, t) => {
    if (t.type === 'transfer') {
      if (t.accountId === account.id) return balance - t.amount;
      if (t.transferAccountId === account.id) return balance + t.amount;
      return balance;
    }

    if (t.accountId !== account.id) return balance;

    return t.type === 'income' ? balance + t.amount : balance - t.amount;
  }, account.initialBalance);
}

export function getTotalBalance(
  accounts: Account[],
  transactions: Transaction[],
): Money {
  return accounts
    .filter((account) => !account.archived)
    .reduce(
      (total, account) => total + getAccountBalance(account, transactions),
      0,
    );
}

export function getOnBudgetBalance(
  accounts: Account[],
  transactions: Transaction[],
): Money {
  return getTotalBalance(
    accounts.filter((account) => account.onBudget),
    transactions,
  );
}
