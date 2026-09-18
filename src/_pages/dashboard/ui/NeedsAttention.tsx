'use client';

import { getAccountName, useAccountStore } from '@/entities/account';
import {
  getBudgetProgress,
  getNearLimitBudgets,
  useBudgetStore,
} from '@/entities/budget';
import { useTransactionStore } from '@/entities/transaction';
import { formatCurrency } from '@/shared/lib/currency';
import { daysLeftInMonth } from '@/shared/lib/date';
import Link from 'next/link';

import './NeedsAttention.scss';

const ATTENTION_THRESHOLD = 80;

function detailFor(remaining: number, daysLeft: number): string {
  if (remaining < 0) {
    return `${formatCurrency(-remaining)} over the monthly budget`;
  }
  if (daysLeft === 0) {
    return `${formatCurrency(remaining)} left and the month ends today`;
  }
  return `${formatCurrency(remaining)} left for ${daysLeft} more ${daysLeft === 1 ? 'day' : 'days'}`;
}

export function NeedsAttention() {
  const { accounts } = useAccountStore();
  const { transactions } = useTransactionStore();
  const { budgets } = useBudgetStore();

  const today = new Date();
  const daysLeft = daysLeftInMonth(today);
  const items = getNearLimitBudgets(
    budgets,
    transactions,
    ATTENTION_THRESHOLD,
    today,
  )
    .map((budget) => ({
      budget,
      progress: getBudgetProgress(budget, transactions, today),
    }))
    .sort((a, b) => b.progress.percentage - a.progress.percentage);

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="dashboard-attention">
      <div className="section-header">
        <h2 id="dashboard-attention" className="section-header__title">
          Needs attention
        </h2>
        <Link href="/budgets" className="section-header__link">
          See budgets
        </Link>
      </div>
      <div className="needs-attention">
        {items.map(({ budget, progress }) => (
          <Link
            key={budget.id}
            href="/budgets"
            className="needs-attention__item"
          >
            <span className="needs-attention__info">
              <span className="needs-attention__name">
                {getAccountName(accounts, budget.accountId)}
              </span>
              <span className="needs-attention__detail">
                {detailFor(progress.remaining, daysLeft)}
              </span>
            </span>
            <span
              className={`needs-attention__value ${
                progress.isOverBudget ? 'needs-attention__value--over' : ''
              }`}
            >
              {progress.percentage}% used
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
