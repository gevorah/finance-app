'use client';

import './page.scss';

import { BalanceCard } from '@/features/metrics/BalanceCard';
import { MetricCard } from '@/features/metrics/MetricCard';
import { TransactionCard } from '@/features/metrics/TransactionCard';
import { Button } from '@/shared/components/ui/button';
import { Calendar } from '@/shared/components/ui/calendar';
import { Card } from '@/shared/components/ui/card';
import { DateField } from '@/shared/components/ui/date-field';
import { DatePicker } from '@/shared/components/ui/date-picker';
import { NumberField } from '@/shared/components/ui/number-field';
import { TextField } from '@/shared/components/ui/text-field';

export default function Home() {
  return (
    <main className="page-container">
      <h1>finance-app</h1>
      <Button type={'secondary'} size={'large'} border={true}>
        Cancel
      </Button>
      <Button type={'primary'} size={'large'}>
        Save Transaction
      </Button>
      <BalanceCard
        balance={'20,589.30'}
        stats={[
          { icon: 'income', label: 'Income', value: '+$8,450.00' },
          { icon: 'expense', label: 'Expenses', value: '-$3,280.50' },
        ]}
      ></BalanceCard>
      <MetricCard
        title={'Monthly Expenses'}
        value={'$3,280'}
        icon={'expense'}
        trend="12% vs last month"
      ></MetricCard>
      <TransactionCard
        icon={
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"></path>
          </svg>
        }
        title={'Starbucks Coffee'}
        description={'Food & Drinks'}
        value={'-$5.80'}
        date={'Today'}
      ></TransactionCard>
      <TextField label="Name" />
      <NumberField
        label="Amount"
        formatOptions={{ style: 'currency', currency: 'COP' }}
      />
      <DateField label="Date" />
      <Calendar />
      <DatePicker />
    </main>
  );
}
