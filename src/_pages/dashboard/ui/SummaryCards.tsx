'use client';

import type { Account } from '@/entities/account';
import {
  buildProjectionReadiness,
  getAmountOwed,
  getDebtAccounts,
  getDebtPayoffProgress,
  getTotalDebt,
  projectStrategies,
  useAccountStore,
} from '@/entities/account';
import { getBudgetSummary, useBudgetStore } from '@/entities/budget';
import type { Transaction } from '@/entities/transaction';
import { useTransactionStore } from '@/entities/transaction';
import Bar from '@/shared/components/ui/bar/bar';
import { formatCurrency } from '@/shared/lib/currency';
import { daysLeftInMonth, formatMonthsAhead } from '@/shared/lib/date';
import Link from 'next/link';

import './SummaryCards.scss';

interface SummaryCardProps {
  href: string;
  label: string;
  value: string;
  context: string;
  note: string;
  progress: number;
  tone?: 'neutral' | 'danger';
  barTone?: 'primary' | 'danger';
}

function SummaryCard({
  href,
  label,
  value,
  context,
  note,
  progress,
  tone = 'neutral',
  barTone = 'primary',
}: SummaryCardProps) {
  return (
    <Link href={href} className="summary-card">
      <div className="summary-card__top">
        <div>
          <p className="summary-card__label">{label}</p>
          <p className={`summary-card__value summary-card__value--${tone}`}>
            {value}
          </p>
        </div>
        <p className="summary-card__context">{context}</p>
      </div>
      <div className="summary-card__bar">
        <Bar percentage={progress} tone={barTone} />
      </div>
      <p className="summary-card__note">{note}</p>
    </Link>
  );
}

function daysLeftLabel(daysLeft: number): string {
  if (daysLeft === 0) return 'Last day';
  return `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`;
}

function getPayoffFragment(
  accounts: Account[],
  transactions: Transaction[],
  today: Date,
): string {
  const readiness = buildProjectionReadiness(accounts, transactions);
  if (readiness.status !== 'ready') return 'payoff date needs payment terms';

  const outcome = projectStrategies(readiness.debts, 0);
  if (outcome.status !== 'ok') return 'the minimums never clear it';

  const months = Math.min(outcome.snowball.months, outcome.avalanche.months);
  return `debt-free ${formatMonthsAhead(today, months)}`;
}

export function SummaryCards() {
  const { accounts } = useAccountStore();
  const { transactions } = useTransactionStore();
  const { budgets } = useBudgetStore();

  const today = new Date();
  const budget = getBudgetSummary(budgets, transactions, today);
  const outstandingDebts = getDebtAccounts(accounts).filter(
    (account) => getAmountOwed(account, transactions) > 0,
  );
  const payoff = getDebtPayoffProgress(accounts, transactions);

  const hasBudgets = budgets.length > 0;
  const hasDebts = outstandingDebts.length > 0;
  if (!hasBudgets && !hasDebts) return null;

  return (
    <div className="summary-cards">
      {hasBudgets && (
        <SummaryCard
          href="/budgets"
          label="Budget left"
          value={formatCurrency(budget.remaining)}
          context={daysLeftLabel(daysLeftInMonth(today))}
          note={`${budget.percentage}% used · ${formatCurrency(budget.spent)} of ${formatCurrency(budget.limit)}`}
          progress={budget.percentage}
          tone={budget.remaining < 0 ? 'danger' : 'neutral'}
          barTone={budget.remaining < 0 ? 'danger' : 'primary'}
        />
      )}
      {hasDebts && (
        <SummaryCard
          href="/debts"
          label="Debt paid off"
          value={`${payoff.percentage}%`}
          context={`${outstandingDebts.length} ${outstandingDebts.length === 1 ? 'debt' : 'debts'}`}
          note={`${formatCurrency(getTotalDebt(accounts, transactions))} owed · ${getPayoffFragment(accounts, transactions, today)}`}
          progress={payoff.percentage}
          barTone="danger"
        />
      )}
    </div>
  );
}
