'use client';

import './Dashboard.scss';

import { SpendingChart } from '@/features/charts/spending-chart.tsx/SpendingChart';
import { BalanceCard } from '@/features/metrics/BalanceCard';
import { MetricCard } from '@/features/metrics/MetricCard';
import TransactionList from '@/features/transactions/transaction-list/TransactionList';
import {
  getBalance,
  getMonthlyExpenses,
  getMonthlyIncome,
  getRecentTransactions,
  getTotalExpenses,
  getTotalIncome,
  monthOverMonthExpenses,
  monthOverMonthIncome,
} from '@/stores/selectors';
import { useTransactionStore } from '@/stores/transactionStore';
import Link from 'next/link';

import { ComparisonChart } from '../charts/comparison-chart/ComparisonChart';
import { WeeklySpendingChart } from '../charts/weekly-spending-chart/WeeklySpendingChart';

export default function Dashboard() {
  const { transactions } = useTransactionStore();
  const recentTransactions = getRecentTransactions(transactions, 5);
  return (
    <div className="page">
      <main className="page-container">
        <div className="balance-cards">
          <BalanceCard
            balance={getBalance(transactions)}
            stats={[
              {
                icon: 'income',
                label: 'Income',
                value: getTotalIncome(transactions),
              },
              {
                icon: 'expense',
                label: 'Expenses',
                value: getTotalExpenses(transactions),
              },
            ]}
          ></BalanceCard>
          <div className="metrics">
            <MetricCard
              title={'Monthly Expenses'}
              value={getMonthlyExpenses(
                transactions,
                new Date().getFullYear(),
                new Date().getMonth() + 1,
              )}
              icon={'expense'}
              trend={
                monthOverMonthExpenses(
                  transactions,
                  new Date().getFullYear(),
                  new Date().getMonth() + 1,
                ).toFixed(1) + '% vs last month'
              }
            ></MetricCard>
            <MetricCard
              title={'Monthly Income'}
              value={getMonthlyIncome(
                transactions,
                new Date().getFullYear(),
                new Date().getMonth() + 1,
              )}
              icon={'income'}
              trend={
                monthOverMonthIncome(
                  transactions,
                  new Date().getFullYear(),
                  new Date().getMonth() + 1,
                ).toFixed(1) + '% vs last month'
              }
            ></MetricCard>
          </div>
        </div>
        <div className="chart-container">
          <WeeklySpendingChart />
          <SpendingChart />
          <ComparisonChart />
        </div>
        <div className="transaction-header">
          <h3 className="transaction-header__title">Recent Transactions</h3>
          <Link href="/transactions" className="transaction-header__link">
            See all
          </Link>
        </div>
        <TransactionList transactions={recentTransactions} />
      </main>
    </div>
  );
}
