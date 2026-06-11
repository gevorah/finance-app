import { CategoryType } from '@/entities/category';
import { Transaction } from '@/entities/transaction';

export function getTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getMonthlyIncome(
  transactions: Transaction[],
  year: number,
  month: number,
): number {
  const monthlyTransactions = getTransactionsByMonth(transactions, year, month);
  return getTotalIncome(monthlyTransactions);
}

export function getMonthlyExpenses(
  transactions: Transaction[],
  year: number,
  month: number,
): number {
  const monthlyTransactions = getTransactionsByMonth(transactions, year, month);
  return getTotalExpenses(monthlyTransactions);
}

export function monthOverMonthExpenses(
  transactions: Transaction[],
  year: number,
  month: number,
): number {
  const actualMonth = getMonthlyExpenses(transactions, year, month);
  const previousMonthExpenses = getMonthlyExpenses(
    transactions,
    year,
    month - 1,
  );
  return ((actualMonth - previousMonthExpenses) / previousMonthExpenses) * 100;
}

export function monthOverMonthIncome(
  transactions: Transaction[],
  year: number,
  month: number,
): number {
  const actualMonth = getMonthlyIncome(transactions, year, month);
  const previousMonthIncome = getMonthlyIncome(transactions, year, month - 1);
  return ((actualMonth - previousMonthIncome) / previousMonthIncome) * 100;
}

export function getTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getBalance(transactions: Transaction[]): number {
  return getTotalIncome(transactions) - getTotalExpenses(transactions);
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

export function getSpendingByCategory(
  transactions: Transaction[],
): Record<CategoryType, number> {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] ?? 0) + t.amount;
        return acc;
      },
      {} as Record<CategoryType, number>,
    );
}

export function getmonthIncomeExpense(
  transactions: Transaction[],
  currentDate: Date,
  amountMonth: number,
) {
  const monthIncomeExpense = Array.from({ length: amountMonth }).map(
    (_, index) => {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - index,
      );
      const month = date.getMonth() + 1;
      const monthText = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const expenses = getMonthlyExpenses(transactions, year, month);
      const income = getMonthlyIncome(transactions, year, month);
      return { monthText, income, expenses };
    },
  );

  return monthIncomeExpense;
}

export function getWeeklySpending(
  transactions: Transaction[],
  currentDate: Date,
) {
  const weeklySpending = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - index,
    );
    const day = date.getDay();
    const shortDayName = date.toLocaleDateString('en-US', {
      weekday: 'short',
    });
    const dayTransactions = getTotalExpenses(
      transactions.filter((t) => t.date === date.toISOString().split('T')[0]),
    );
    return { day, shortDayName, dayTransactions };
  });
  return weeklySpending;
}

export function getRecentTransactions(
  transactions: Transaction[],
  count: number,
): Transaction[] {
  return [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, count);
}
