import type { Transaction } from '@/entities/transaction';
import { Money } from '@/shared/lib/money';

import { DebtStatus } from './debt-terms';
import { getAccountBalance } from './selectors';
import { Account, ACCOUNT_ROOTS } from './types';

/** What is owed is the account balance read as a positive figure. */
export function getAmountOwed(
  account: Account,
  transactions: Transaction[],
): Money {
  return -getAccountBalance(account, transactions);
}

export function getDebtAccounts(accounts: Account[]): Account[] {
  return accounts.filter(
    (account) =>
      account.root === ACCOUNT_ROOTS.LIABILITIES && !account.archived,
  );
}

export function getDebtStatus(
  account: Account,
  transactions: Transaction[],
  today: string = new Date().toISOString().slice(0, 10),
): DebtStatus {
  if (getAmountOwed(account, transactions) <= 0) return 'paid_off';

  const dueDate = account.debtTerms?.paymentTerms.nextPaymentDueDate;
  if (dueDate && dueDate < today) return 'late';

  return 'current';
}

export function getTotalDebt(
  accounts: Account[],
  transactions: Transaction[],
): Money {
  return getDebtAccounts(accounts).reduce(
    (total, account) =>
      total + Math.max(getAmountOwed(account, transactions), 0),
    0,
  );
}

/**
 * A yearly rate is quoted as an effective annual rate, so its monthly
 * equivalent compounds rather than divides. Dividing by twelve overstates it,
 * and orders two debts the wrong way round when one of them is quoted monthly.
 */
export function getMonthlyInterestRate(account: Account): number {
  const interest = account.debtTerms?.interest;
  if (!interest || interest.type === 'none') return 0;
  if (interest.period === 'monthly') return interest.rate;

  return ((1 + interest.rate / 100) ** (1 / 12) - 1) * 100;
}

export const DEBT_STRATEGIES = {
  SNOWBALL: 'snowball',
  AVALANCHE: 'avalanche',
} as const;

export type DebtStrategy =
  (typeof DEBT_STRATEGIES)[keyof typeof DEBT_STRATEGIES];

/**
 * Snowball pays the smallest balance first, avalanche the highest rate. Both
 * are orderings of the same accounts, so neither needs a stored priority.
 */
export function orderDebtsByStrategy(
  accounts: Account[],
  transactions: Transaction[],
  strategy: DebtStrategy,
): Account[] {
  const outstanding = getDebtAccounts(accounts).filter(
    (account) => getAmountOwed(account, transactions) > 0,
  );

  if (strategy === DEBT_STRATEGIES.AVALANCHE) {
    return [...outstanding].sort(
      (a, b) => getMonthlyInterestRate(b) - getMonthlyInterestRate(a),
    );
  }

  return [...outstanding].sort(
    (a, b) => getAmountOwed(a, transactions) - getAmountOwed(b, transactions),
  );
}
