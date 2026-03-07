'use client';

import { BalanceCard } from '@/features/metrics/BalanceCard';
import { MetricCard } from '@/features/metrics/MetricCard';
import { Button } from '@/shared/components/ui/button';
import { Calendar } from '@/shared/components/ui/calendar';
import { DateField } from '@/shared/components/ui/date-field';
import { DatePicker } from '@/shared/components/ui/date-picker';
import { NumberField } from '@/shared/components/ui/number-field';
import { TextField } from '@/shared/components/ui/text-field';

export default function Home() {
  return (
    <div className="page">
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
        <TextField label="Name" />
        <NumberField
          label="Amount"
          formatOptions={{ style: 'currency', currency: 'COP' }}
        />
        <DateField label="Date" />
        <Calendar />
        <DatePicker />
      </main>
    </div>
  );
}
