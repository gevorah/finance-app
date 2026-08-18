'use client';

import { Card } from '@/shared/components/ui/card';

import './BudgetCard.scss';

import Bar from '@/shared/components/ui/bar/bar';
import { formatCurrency } from '@/shared/lib/currency';
import { getBudgetSummary } from '@/entities/budget';
import { useBudgetStore } from '@/entities/budget';
import { useTransactionStore } from '@/entities/transaction';

function daysLeftInMonth(date: Date): number {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return lastDay - date.getDate();
}

function getSummaryMessage(percentage: number, daysLeft: number): string {
  if (percentage > 100) return 'You are over budget this month.';
  if (percentage >= 80) return `Careful — close to your limit with ${daysLeft} days left.`;
  return `You are on track. ${daysLeft} days left this month.`;
}

export function BudgetCard() {
  const { budgets } = useBudgetStore();
  const { transactions } = useTransactionStore();
  const { spent, limit, remaining, percentage } = getBudgetSummary(
    budgets,
    transactions,
  );
  const daysLeft = daysLeftInMonth(new Date());

  return (
    <Card type="primary" className="budget-card">
      <div className="budget-header">
        <h3 className="budget-header__title">MONTHLY BUDGET</h3>
        <p className="budget-header__remaining">
          {formatCurrency(remaining)} remaining
        </p>
      </div>
      <section className="budget-info">
        <p className="budget-amount">
          <span className="budget-amount__spent">
            {formatCurrency(spent)}{' '}
          </span>
          of {formatCurrency(limit)}
        </p>
        <Bar percentage={percentage} />
        <p className="budget-message">
          {getSummaryMessage(percentage, daysLeft)}
        </p>
      </section>
    </Card>
  );
}
