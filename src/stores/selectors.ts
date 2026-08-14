import { Budget } from '@/entities/budget';
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
  const [prevYear, prevMonth] = month === 1 ? [year - 1, 12] : [year, month - 1];
  const previousMonthExpenses = getMonthlyExpenses(
    transactions,
    prevYear,
    prevMonth,
  );
  if (previousMonthExpenses === 0) return 0;
  return ((actualMonth - previousMonthExpenses) / previousMonthExpenses) * 100;
}

export function monthOverMonthIncome(
  transactions: Transaction[],
  year: number,
  month: number,
): number {
  const actualMonth = getMonthlyIncome(transactions, year, month);
  const [prevYear, prevMonth] = month === 1 ? [year - 1, 12] : [year, month - 1];
  const previousMonthIncome = getMonthlyIncome(transactions, prevYear, prevMonth);
  if (previousMonthIncome === 0) return 0;
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

export function getMonthIncomeExpense(
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

export function getTopTransactions(
  transactions: Transaction[],
  count: number,
): Transaction[]{
  return [...transactions].sort((a, b) => b.amount - a.amount).slice(0, count);
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

export function getBudgetSpent(
  transactions: Transaction[],
  category: CategoryType,
  year: number,
  month: number,
): number {
  const monthlyTransactions = getTransactionsByMonth(transactions, year, month);
  return getSpendingByCategory(monthlyTransactions)[category] ?? 0;
}

export interface BudgetProgress {
  spent: number;
  limit: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

export function getBudgetProgress(
  budget: Budget,
  transactions: Transaction[],
  refDate: Date = new Date(),
): BudgetProgress {
  const spent = getBudgetSpent(
    transactions,
    budget.category,
    refDate.getFullYear(),
    refDate.getMonth() + 1,
  );
  const limit = budget.monthlyLimit;
  const remaining = limit - spent;
  const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;
  return { spent, limit, remaining, percentage, isOverBudget: spent > limit };
}

export function getNearLimitBudgets(
  budgets: Budget[],
  transactions: Transaction[],
  threshold = 80,
  refDate: Date = new Date(),
): Budget[] {
  return budgets.filter(
    (b) => getBudgetProgress(b, transactions, refDate).percentage >= threshold,
  );
}

export interface BudgetSummary {
  spent: number;
  limit: number;
  remaining: number;
  percentage: number;
}

export function getBudgetSummary(
  budgets: Budget[],
  transactions: Transaction[],
  refDate: Date = new Date(),
): BudgetSummary {
  const totals = budgets.reduce(
    (acc, budget) => {
      const { spent, limit } = getBudgetProgress(budget, transactions, refDate);
      acc.spent += spent;
      acc.limit += limit;
      return acc;
    },
    { spent: 0, limit: 0 },
  );
  const remaining = totals.limit - totals.spent;
  const percentage =
    totals.limit > 0 ? Math.round((totals.spent / totals.limit) * 100) : 0;
  return { ...totals, remaining, percentage };
}

export interface BudgetHighlight {
  label: string;
  budget: Budget;
  progress: BudgetProgress;
}

export function getBudgetHighlights(
  budgets: Budget[],
  transactions: Transaction[],
  refDate: Date = new Date(),
): BudgetHighlight[] {
  const entries = budgets.map((budget) => ({
    budget,
    progress: getBudgetProgress(budget, transactions, refDate),
  }));

  if (entries.length === 0) return [];

  const byPercentageDesc = [...entries].sort(
    (a, b) => b.progress.percentage - a.progress.percentage,
  );
  const bySpentDesc = [...entries].sort(
    (a, b) => b.progress.spent - a.progress.spent,
  );

  const candidates = [
    { label: 'Most used', entry: bySpentDesc[0] },
    { label: 'Closest to limit', entry: byPercentageDesc[0] },
    { label: 'Healthiest', entry: byPercentageDesc[byPercentageDesc.length - 1] },
  ];

  const seen = new Set<string>();
  return candidates.reduce<BudgetHighlight[]>((acc, { label, entry }) => {
    if (seen.has(entry.budget.id)) return acc;
    seen.add(entry.budget.id);
    acc.push({ label, ...entry });
    return acc;
  }, []);
}
