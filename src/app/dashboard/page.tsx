'use client';

import './Dashboard.scss';

import { SpendingChart } from '@/features/charts/spending-chart/SpendingChart';
import TransactionList from '@/features/transactions/transaction-list/TransactionList';
import { useHydrated } from '@/shared/hooks/useHydrated';
import { useAccountStore } from '@/entities/account';
import { getMonthIncomeExpense, getMonthlyExpenses, getMonthlyIncome, getRecentTransactions, getSpendingByAccount, getTotalExpenses, getTotalIncome, getWeeklySpending, monthOverMonthExpenses, monthOverMonthIncome } from '@/entities/transaction';
import { getTotalBalance } from '@/entities/account';
import { useTransactionStore } from '@/entities/transaction';
import Link from 'next/link';

import { ComparisonChart } from '@/features/charts/comparison-chart/ComparisonChart';
import { WeeklySpendingChart } from '@/features/charts/weekly-spending-chart/WeeklySpendingChart';
import { BalanceCard } from './BalanceCard';
import { MetricCard } from './MetricCard';
import { DashboardSkeleton } from './DashboardSkeleton';

export default function DashboardPage() {
  const hydrated = useHydrated();
  const { transactions } = useTransactionStore();
  const { accounts } = useAccountStore();

  if (!hydrated) return <DashboardSkeleton />;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

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
        <div className="balance-cards">
          <BalanceCard
            balance={getTotalBalance(accounts, transactions)}
            stats={[
              {
                icon: 'income',
                label: 'Income',
                value: getTotalIncome(transactions, accounts),
              },
              {
                icon: 'expense',
                label: 'Expenses',
                value: getTotalExpenses(transactions, accounts),
              },
            ]}
          ></BalanceCard>
          <div className="metrics">
            <MetricCard
              title={'Monthly Expenses'}
              value={getMonthlyExpenses(transactions, accounts, year, month)}
              icon={'expense'}
              trend={
                monthOverMonthExpenses(transactions, accounts, year, month).toFixed(1) +
                '% vs last month'
              }
            ></MetricCard>
            <MetricCard
              title={'Monthly Income'}
              value={getMonthlyIncome(transactions, accounts, year, month)}
              icon={'income'}
              trend={
                monthOverMonthIncome(transactions, accounts, year, month).toFixed(1) +
                '% vs last month'
              }
            ></MetricCard>
          </div>
        </div>
        <div className="chart-container">
          <WeeklySpendingChart data={weeklySpendingData} />
          <SpendingChart
            data={spendingByAccountData}
            accountNames={accountNames}
          />
          <ComparisonChart data={comparisonData} />
        </div>
        <div className="transaction-header">
          <h3 className="transaction-header__title">Recent Transactions</h3>
          <Link href="/transactions" className="transaction-header__link">
            See all
          </Link>
        </div>
        <TransactionList transactions={recentTransactions} />
      </section>
    </div>
  );
}
