'use client';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import "./page.scss"
import { Calendar } from '@/shared/components/ui/calendar';
import { DateField } from '@/shared/components/ui/date-field';
import { DatePicker } from '@/shared/components/ui/date-picker';
import { NumberField } from '@/shared/components/ui/number-field';
import { TextField } from '@/shared/components/ui/text-field';

export default function Home() {
  return (
    <main className='page-container'>
      <h1>finance-app</h1>
      <Button type={'secondary'} size={'large'} border={true}>
        Cancel
      </Button>
      <Button type={'primary'} size={'large'}>
        Save Transaction
      </Button>
      <Card
        title={'total balance'}
        description={'$24.500,80'}
        type={'primary'}
        stats={[
          { icon: 'income', label: 'Income', value: '+$8,450.00' },
          { icon: 'expense', label: 'Expenses', value: '-$3,280.50' },
        ]}
      ></Card>
      <Card
        title={'Monthly Expenses'}
        description={'$3,280'}
        type={'secondary'}
        stats={[{icon: 'expense', label: '12% Last month', value: ''}]}
      ></Card>
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
