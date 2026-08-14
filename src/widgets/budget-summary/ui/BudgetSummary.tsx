'use client';

import { getCategoryIcon, getCategoryLabel } from '@/entities/category';
import { formatCurrency } from '@/shared/lib/currency';
import Bar from '@/shared/components/ui/bar/bar';
import { Card } from '@/shared/components/ui/card';
import { useBudgetStore } from '@/stores/budgetStore';
import { getBudgetHighlights } from '@/stores/selectors';
import { useTransactionStore } from '@/stores/transactionStore';
import Link from 'next/link';

import './BudgetSummary.scss';

export function BudgetSummary() {
  const { budgets } = useBudgetStore();
  const { transactions } = useTransactionStore();
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
            <span className="budget-highlight__label">{highlight.label}</span>
            <div className="budget-highlight__category">
              <span className="budget-highlight__icon">
                {getCategoryIcon(highlight.budget.category, 16)}
              </span>
              <span className="budget-highlight__name">
                {getCategoryLabel(highlight.budget.category)}
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
