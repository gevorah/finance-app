import type { Transaction } from '@/entities/transaction';
import { Money } from '@/shared/lib/money';

import { Budget } from './types';

function spentOnAccount(
  transactions: Transaction[],
  accountId: string,
  year: number,
  month: number,
): Money {
  return transactions
    .filter((t) => {
      const [y, m] = t.date.split('-').map(Number);
      return y === year && m === month;
    })
    .reduce(
      (total, t) =>
        total +
        t.postings
          .filter((posting) => posting.accountId === accountId)
          .reduce((sum, posting) => sum + posting.amount, 0),
      0,
    );
}

export function getBudgetSpent(
  transactions: Transaction[],
  accountId: string,
  year: number,
  month: number,
): Money {
  return spentOnAccount(transactions, accountId, year, month);
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
    budget.accountId,
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

export type BudgetHighlightKind = 'mostUsed' | 'closestToLimit' | 'healthiest';

export interface BudgetHighlight {
  kind: BudgetHighlightKind;
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

  const candidates: {
    kind: BudgetHighlightKind;
    entry: (typeof entries)[number];
  }[] = [
    { kind: 'mostUsed', entry: bySpentDesc[0] },
    { kind: 'closestToLimit', entry: byPercentageDesc[0] },
    { kind: 'healthiest', entry: byPercentageDesc[byPercentageDesc.length - 1] },
  ];

  const seen = new Set<string>();
  return candidates.reduce<BudgetHighlight[]>((acc, { kind, entry }) => {
    if (seen.has(entry.budget.id)) return acc;
    seen.add(entry.budget.id);
    acc.push({ kind, ...entry });
    return acc;
  }, []);
}

export function getBudgetAccountIds(budgets: Budget[]): string[] {
  return budgets.map((budget) => budget.accountId);
}
