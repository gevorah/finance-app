'use client';

import { Calendar } from '@/shared/components/ui/calendar';
import { DateField } from '@/shared/components/ui/date-field';
import { DatePicker } from '@/shared/components/ui/date-picker';
import { NumberField } from '@/shared/components/ui/number-field';
import { TextField } from '@/shared/components/ui/text-field';

export default function Home() {
  return (
    <main>
      <h1>finance-app</h1>
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
