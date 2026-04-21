import { CATEGORY_TYPES } from '@/entities/category';
import { DateValue } from 'react-aria-components';
import z from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive({ error: 'Amount should be above 0' }),
  category: z.enum(CATEGORY_TYPES),
  description: z.string({ error: 'Description is required' }),
  date: z.custom<DateValue>((val) => val !== undefined, {
    error: 'Date is required',
  }),
});

export type TransactionValues = z.input<typeof transactionSchema>;
