import { Account } from '@/entities/account';
import { Budget } from '@/entities/budget';
import { CategoryType } from '@/entities/category';
import { Transaction } from '@/entities/transaction';
import { Money } from '@/shared/lib/money';

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

export function getBudgetSpent(
  transactions: Transaction[],
  category: CategoryType,
  year: number,
  month: number,
): Money {
  const monthlyTransactions = getTransactionsByMonth(transactions, year, month);
  return getSpendingByCategory(monthlyTransactions)[category] ?? 0;
}

export interface BudgetProgress {
  spent: Money;
  limit: Money;
  remaining: Money;
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
  spent: Money;
  limit: Money;
  remaining: Money;
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
    {
      label: 'Healthiest',
      entry: byPercentageDesc[byPercentageDesc.length - 1],
    },
  ];

  const seen = new Set<string>();
  return candidates.reduce<BudgetHighlight[]>((acc, { label, entry }) => {
    if (seen.has(entry.budget.id)) return acc;
    seen.add(entry.budget.id);
    acc.push({ label, ...entry });
    return acc;
  }, []);
}
