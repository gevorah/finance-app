'use client';

import {
  getAccountIcon,
  getAccountName,
  useAccountStore,
} from '@/entities/account';
import { formatCurrency } from '@/shared/lib/currency';
import Bar from '@/shared/components/ui/bar/bar';
import { Card } from '@/shared/components/ui/card';
import {
  BudgetHighlightKind,
  getBudgetHighlights,
  useBudgetStore,
} from '@/entities/budget';
import { useTransactionStore } from '@/entities/transaction';
import Link from 'next/link';

import './BudgetSummary.scss';

const HIGHLIGHT_LABELS: Record<BudgetHighlightKind, string> = {
  mostUsed: 'Most used',
  closestToLimit: 'Closest to limit',
  healthiest: 'Healthiest',
};

export function BudgetSummary() {
  const { budgets } = useBudgetStore();
  const { transactions } = useTransactionStore();
  const { accounts } = useAccountStore();
  const highlights = getBudgetHighlights(budgets, transactions);

  if (highlights.length === 0) return null;

  return (
    <section className="budget-summary-section">
      <div className="budget-summary-section__header">
        <h3 className="budget-summary-section__title">Budgets</h3>
        <Link href="/budgets" className="budget-summary-section__link">
          See all
        </Link>
      </div>
      <div className="budget-summary-section__grid">
        {highlights.map((highlight) => (
          <Card key={highlight.budget.id} className="budget-highlight">
            <span className="budget-highlight__label">{HIGHLIGHT_LABELS[highlight.kind]}</span>
            <div className="budget-highlight__category">
              <span className="budget-highlight__icon">
                {getAccountIcon(
                  accounts.find((a) => a.id === highlight.budget.accountId),
                  16,
                )}
              </span>
              <span className="budget-highlight__name">
                {getAccountName(accounts, highlight.budget.accountId)}
              </span>
              <span className="budget-highlight__percentage">
                {highlight.progress.percentage}%
              </span>
            </div>
            <Bar percentage={highlight.progress.percentage} />
            <p className="budget-highlight__amount">
              {formatCurrency(highlight.progress.spent)} of{' '}
              {formatCurrency(highlight.progress.limit)}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
