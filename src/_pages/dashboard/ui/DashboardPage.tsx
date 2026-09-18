'use client';

import './Dashboard.scss';

import {
  getAvailableBalance,
  getSetAsideBalance,
  getTotalBalance,
  useAccountStore,
} from '@/entities/account';
import {
  getMonthIncomeExpense,
  getRecentTransactions,
  getSpendingByAccount,
  getWeeklySpending,
  useTransactionStore,
} from '@/entities/transaction';
import { ComparisonChart } from '@/features/charts/comparison-chart/ComparisonChart';
import { SpendingChart } from '@/features/charts/spending-chart/SpendingChart';
import { WeeklySpendingChart } from '@/features/charts/weekly-spending-chart/WeeklySpendingChart';
import TransactionList from '@/features/transactions/transaction-list/TransactionList';
import { useHydrated } from '@/shared/hooks/useHydrated';
import Link from 'next/link';

import { BalanceCard } from './BalanceCard';
import { DashboardSkeleton } from './DashboardSkeleton';
import { NeedsAttention } from './NeedsAttention';
import { SummaryCards } from './SummaryCards';

export function DashboardPage() {
  const hydrated = useHydrated();
  const { transactions } = useTransactionStore();
  const { accounts } = useAccountStore();

  if (!hydrated) return <DashboardSkeleton />;

  const now = new Date();

  const recentTransactions = getRecentTransactions(transactions, 5);
  const weeklySpendingData = getWeeklySpending(transactions, accounts, now);
  const spendingByAccountData = getSpendingByAccount(transactions, accounts);
  const accountNames = Object.fromEntries(
    accounts.map((account) => [account.id, account.name]),
  );
  const comparisonData = getMonthIncomeExpense(transactions, accounts, now, 6);

  return (
    <div className="page">
      <section className="page-container">
        <BalanceCard
          balance={getAvailableBalance(accounts, transactions)}
          stats={[
            {
              label: 'Total balance',
              value: getTotalBalance(accounts, transactions),
            },
            {
              label: 'Set aside',
              value: getSetAsideBalance(accounts, transactions),
            },
          ]}
        ></BalanceCard>
        <SummaryCards />
        <NeedsAttention />
        <section aria-labelledby="dashboard-spending">
          <div className="section-header">
            <h2 id="dashboard-spending" className="section-header__title">
              Spending &amp; cash flow
            </h2>
          </div>
          <div className="charts">
            <WeeklySpendingChart data={weeklySpendingData} />
            <SpendingChart
              data={spendingByAccountData}
              accountNames={accountNames}
            />
            <ComparisonChart data={comparisonData} />
          </div>
        </section>
        <section aria-labelledby="dashboard-recent">
          <div className="section-header">
            <h2 id="dashboard-recent" className="section-header__title">
              Recent transactions
            </h2>
            <Link href="/transactions" className="section-header__link">
              See all
            </Link>
          </div>
          <TransactionList transactions={recentTransactions} />
        </section>
      </section>
    </div>
  );
}
