import { CategoryType } from '@/entities/category';
import { Money } from '@/shared/lib/money';

import { Transaction } from './types';

export function getTotalIncome(transactions: Transaction[]): Money {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getTotalExpenses(transactions: Transaction[]): Money {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
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
  year: number,
  month: number,
): Money {
  return getTotalIncome(getTransactionsByMonth(transactions, year, month));
}

export function getMonthlyExpenses(
  transactions: Transaction[],
  year: number,
  month: number,
): Money {
  return getTotalExpenses(getTransactionsByMonth(transactions, year, month));
}

function previousMonth(year: number, month: number): [number, number] {
  return month === 1 ? [year - 1, 12] : [year, month - 1];
}

export function monthOverMonthExpenses(
  transactions: Transaction[],
  year: number,
  month: number,
): number {
  const current = getMonthlyExpenses(transactions, year, month);
  const [prevYear, prevMonth] = previousMonth(year, month);
  const previous = getMonthlyExpenses(transactions, prevYear, prevMonth);
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function monthOverMonthIncome(
  transactions: Transaction[],
  year: number,
  month: number,
): number {
  const current = getMonthlyIncome(transactions, year, month);
  const [prevYear, prevMonth] = previousMonth(year, month);
  const previous = getMonthlyIncome(transactions, prevYear, prevMonth);
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function getSpendingByCategory(
  transactions: Transaction[],
): Record<CategoryType, Money> {
  return transactions
    .filter((t) => t.type === 'expense' && t.category !== undefined)
    .reduce(
      (acc, t) => {
        const category = t.category as CategoryType;
        acc[category] = (acc[category] ?? 0) + t.amount;
        return acc;
      },
      {} as Record<CategoryType, Money>,
    );
}

export function getCategorySpendingPercentages(
  transactions: Transaction[],
): Record<CategoryType, number> {
  const spendingByCategory = getSpendingByCategory(transactions);
  const total = getTotalExpenses(transactions);
  return Object.entries(spendingByCategory).reduce(
    (acc, [category, amount]) => {
      acc[category as CategoryType] =
        total > 0 ? Math.round((amount / total) * 100) : 0;
      return acc;
    },
    {} as Record<CategoryType, number>,
  );
}

export function getMonthIncomeExpense(
  transactions: Transaction[],
  currentDate: Date,
  amountMonth: number,
) {
  return Array.from({ length: amountMonth }).map((_, index) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - index,
    );
    const month = date.getMonth() + 1;
    const monthText = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return {
      monthText,
      income: getMonthlyIncome(transactions, year, month),
      expenses: getMonthlyExpenses(transactions, year, month),
    };
  });
}

export function getWeeklySpending(
  transactions: Transaction[],
  currentDate: Date,
) {
  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - index,
    );
    const day = date.getDay();
    const shortDayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayTransactions = getTotalExpenses(
      transactions.filter((t) => t.date === date.toISOString().split('T')[0]),
    );
    return { day, shortDayName, dayTransactions };
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

export function getTopTransactions(
  transactions: Transaction[],
  count: number,
): Transaction[] {
  return [...transactions].sort((a, b) => b.amount - a.amount).slice(0, count);
}
