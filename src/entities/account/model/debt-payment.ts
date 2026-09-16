import { DateValue } from 'react-aria-components';
import z from 'zod';

export const debtPaymentSchema = z
  .object({
    debtAccountId: z.string().min(1, { error: 'Debt is required' }),
    paymentAccountId: z.string().min(1, { error: 'Account is required' }),
    amount: z
      .number({ error: 'Amount is required' })
      .positive({ error: 'Amount should be above 0' }),
    interest: z
      .number({ error: 'Interest is required' })
      .min(0, { error: 'Interest cannot be negative' }),
    date: z.custom<DateValue>((val) => val !== undefined && val !== null, {
      error: 'Date is required',
    }),
  })
  .refine((data) => data.interest < data.amount, {
    error: 'Interest should be less than the total payment',
    path: ['interest'],
  })
  .refine((data) => data.paymentAccountId !== data.debtAccountId, {
    error: 'A debt cannot pay itself',
    path: ['paymentAccountId'],
  });

export type DebtPaymentValues = z.input<typeof debtPaymentSchema>;
