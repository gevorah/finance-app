'use client';

import { DateField } from '@/shared/components/ui/date-field';
import { NumberField } from '@/shared/components/ui/number-field';
import { TextField } from '@/shared/components/ui/text-field';

export default function Home() {
  return (
    <main>
      <h1>finance-app</h1>
      <TextField label="Name" />
      <NumberField
        label="Amount"
        formatOptions={{ style: 'currency', currency: 'USD' }}
      />
      <DateField label="Date" />
    </main>
  );
}
