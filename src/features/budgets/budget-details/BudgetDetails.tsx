'use client';

import Bar from '@/shared/components/ui/bar/bar';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { useBudgetStore } from '@/entities/budget';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import './BudgetDetails.scss';

import { getCategoryIcon, getCategoryLabel } from '@/entities/category';
import { formatCurrency } from '@/shared/lib/currency';
import { formatDate } from '@/shared/lib/date';
import { getTopTransactions } from '@/entities/transaction';
import { getBudgetProgress, getBudgetSpent } from '@/entities/budget';
import { useTransactionStore } from '@/entities/transaction';

export function BudgetDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { budgets } = useBudgetStore();
  const { transactions } = useTransactionStore();
  const budgetDetail = budgets.find((item) => item.id === id);
  const transactionsCategory = transactions.filter(
    (t) => t.category === budgetDetail?.category,
  );
  const topTransactions = getTopTransactions(transactionsCategory, 3);

  if (!budgetDetail) return null;

  const now = new Date();
  const { spent, percentage } = getBudgetProgress(budgetDetail, transactions, now);
  const dailyAvg = Math.round(spent / now.getDate());

  const [prevYear, prevMonth] =
    now.getMonth() === 0
      ? [now.getFullYear() - 1, 12]
      : [now.getFullYear(), now.getMonth()];
  const prevSpent = getBudgetSpent(
    transactions,
    budgetDetail.category,
    prevYear,
    prevMonth,
  );
  const change =
    prevSpent > 0 ? Math.round(((spent - prevSpent) / prevSpent) * 100) : null;
  const monthChange =
    change === null
      ? 'No spending last month'
      : `${change >= 0 ? '+' : ''}${change}% vs last month`;

  return (
    <main className="budget-details">
      <div className="back-section">
        <Button variant="secondary" size="small" onPress={() => router.back()}>
          <ArrowLeft /> <span>Back</span>
        </Button>
      </div>

      <section className="budget-header">
        <div className="budget-header__icon">
          {getCategoryIcon(budgetDetail.category, 28)}
        </div>
        <h2 className="budget-header__category">{getCategoryLabel(budgetDetail.category)}</h2>
        <p className="budget-header__daily-avg">
          {formatCurrency(dailyAvg)}/day avg
        </p>
      </section>

      <section className="budget-summary">
        <h1 className="budget-summary__amounts">
          <span className="budget-summary__spent">
            {formatCurrency(spent)}
          </span>{' '}
          / {formatCurrency(budgetDetail.monthlyLimit)}
        </h1>
        <Bar percentage={percentage} />
        <span className="budget-summary__change">{monthChange}</span>
      </section>

      <Card className="budget-info">
        <h4 className="budget-info__title">DETAILS</h4>
        <ul className="budget-info__list">
          <li>
            <span>Spent</span>
            <span>{formatCurrency(spent)}</span>
          </li>
          <li>
            <span>Budget</span>
            <span>{formatCurrency(budgetDetail.monthlyLimit)}</span>
          </li>
          <li>
            <span>Used</span>
            <span>{percentage}%</span>
          </li>
          <li>
            <span>Daily Average</span>
            <span>{formatCurrency(dailyAvg)}/day avg</span>
          </li>
        </ul>
      </Card>

      <Card className="budget-transactions">
        <h4 className="budget-transactions__title">TOP TRANSACTIONS</h4>
        <div className="budget-transactions__list">
          {topTransactions.map((transaction) => (
            <div className="budget-transactions__item" key={transaction.id}>
              <span className="budget-transactions__description">
                {transaction.description} • {formatDate(transaction.date)}
              </span>
              <span className="budget-transactions__amount">
                {formatCurrency(transaction.amount)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Button
        variant="primary"
        size="large"
        className="budget-details__edit-btn"
        onPress={() => router.push(`/budgets/${id}/edit`)}
      >
        Edit Budget
      </Button>
    </main>
  );
}
