import { Account, ACCOUNT_ROOTS } from '@/entities/account';
import { Money } from '@/shared/lib/money';

import { Transaction } from './types';

export function getAccountPostingsTotal(
  transactions: Transaction[],
  accountId: string,
): Money {
  return transactions.reduce(
    (total, transaction) =>
      total +
      transaction.postings
        .filter((posting) => posting.accountId === accountId)
        .reduce((sum, posting) => sum + posting.amount, 0),
    0,
  );
}

/**
 * Expense accounts accumulate positive amounts and income accounts negative
 * ones, so income is negated to read as a positive figure.
 */
export function getActivityByAccount(
  transactions: Transaction[],
  accounts: Account[],
  root: Account['root'],
): Record<string, Money> {
  const sign = root === ACCOUNT_ROOTS.INCOME ? -1 : 1;

  return accounts
    .filter((account) => account.root === root)
    .reduce<Record<string, Money>>((acc, account) => {
      const total = sign * getAccountPostingsTotal(transactions, account.id);
      if (total !== 0) acc[account.id] = total;
      return acc;
    }, {});
}

export function getTotalForRoot(
  transactions: Transaction[],
  accounts: Account[],
  root: Account['root'],
): Money {
  return Object.values(getActivityByAccount(transactions, accounts, root)).reduce(
    (total, amount) => total + amount,
    0,
  );
}

export function getTotalIncome(
  transactions: Transaction[],
  accounts: Account[],
): Money {
  return getTotalForRoot(transactions, accounts, ACCOUNT_ROOTS.INCOME);
}

export function getTotalExpenses(
  transactions: Transaction[],
  accounts: Account[],
): Money {
  return getTotalForRoot(transactions, accounts, ACCOUNT_ROOTS.EXPENSES);
}

export function getTransactionsByMonth(
  transactions: Transaction[],
  year: number,
  month: number,
): Transaction[] {
  return transactions.filter((t) => {
    const [y, m] = t.date.split('-').map(Number);
    return y === year && m === month;
  });
}

export function getMonthlyIncome(
  transactions: Transaction[],
  accounts: Account[],
  year: number,
  month: number,
): Money {
  return getTotalIncome(
    getTransactionsByMonth(transactions, year, month),
    accounts,
  );
}

export function getMonthlyExpenses(
  transactions: Transaction[],
  accounts: Account[],
  year: number,
  month: number,
): Money {
  return getTotalExpenses(
    getTransactionsByMonth(transactions, year, month),
    accounts,
  );
}

function previousMonth(year: number, month: number): [number, number] {
  return month === 1 ? [year - 1, 12] : [year, month - 1];
}

function percentageChange(current: Money, previous: Money): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function monthOverMonthExpenses(
  transactions: Transaction[],
  accounts: Account[],
  year: number,
  month: number,
): number {
  const [prevYear, prevMonth] = previousMonth(year, month);
  return percentageChange(
    getMonthlyExpenses(transactions, accounts, year, month),
    getMonthlyExpenses(transactions, accounts, prevYear, prevMonth),
  );
}

export function monthOverMonthIncome(
  transactions: Transaction[],
  accounts: Account[],
  year: number,
  month: number,
): number {
  const [prevYear, prevMonth] = previousMonth(year, month);
  return percentageChange(
    getMonthlyIncome(transactions, accounts, year, month),
    getMonthlyIncome(transactions, accounts, prevYear, prevMonth),
  );
}

export function getSpendingByAccount(
  transactions: Transaction[],
  accounts: Account[],
): Record<string, Money> {
  return getActivityByAccount(transactions, accounts, ACCOUNT_ROOTS.EXPENSES);
}

export function getSpendingPercentages(
  transactions: Transaction[],
  accounts: Account[],
): Record<string, number> {
  const spending = getSpendingByAccount(transactions, accounts);
  const total = getTotalExpenses(transactions, accounts);

  return Object.entries(spending).reduce<Record<string, number>>(
    (acc, [accountId, amount]) => {
      acc[accountId] = total > 0 ? Math.round((amount / total) * 100) : 0;
      return acc;
    },
    {},
  );
}

export function getMonthIncomeExpense(
  transactions: Transaction[],
  accounts: Account[],
  currentDate: Date,
  amountMonth: number,
) {
  return Array.from({ length: amountMonth }).map((_, index) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - index,
    );
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return {
      monthText: date.toLocaleString('default', { month: 'short' }),
      income: getMonthlyIncome(transactions, accounts, year, month),
      expenses: getMonthlyExpenses(transactions, accounts, year, month),
    };
  });
}

export function getWeeklySpending(
  transactions: Transaction[],
  accounts: Account[],
  currentDate: Date,
) {
  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - index,
    );
    const isoDate = date.toISOString().split('T')[0];
    return {
      day: date.getDay(),
      shortDayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayTransactions: getTotalExpenses(
        transactions.filter((t) => t.date === isoDate),
        accounts,
      ),
    };
  });
}

export function getRecentTransactions(
  transactions: Transaction[],
  count: number,
): Transaction[] {
  return [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, count);
}

function transactionMagnitude(transaction: Transaction): Money {
  return Math.max(
    ...transaction.postings.map((posting) => Math.abs(posting.amount)),
    0,
  );
}

export function getTopTransactions(
  transactions: Transaction[],
  count: number,
): Transaction[] {
  return [...transactions]
    .sort((a, b) => transactionMagnitude(b) - transactionMagnitude(a))
    .slice(0, count);
}
