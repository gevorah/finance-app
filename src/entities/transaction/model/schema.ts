import { CATEGORY_TYPES } from '@/entities/category';
import { DateValue } from 'react-aria-components';
import z from 'zod';

export const transactionSchema = z
  .object({
    type: z.enum(['income', 'expense', 'transfer']),
    amount: z.number().positive({ error: 'Amount should be above 0' }),
    accountId: z.string().min(1, { error: 'Account is required' }),
    transferAccountId: z.string().optional(),
    category: z.enum(CATEGORY_TYPES).optional(),
    description: z.string().min(1, { error: 'Description is required' }),
    date: z.custom<DateValue>((val) => val !== undefined && val !== null, {
      error: 'Date is required',
    }),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'transfer') {
      if (!data.transferAccountId) {
        ctx.addIssue({
          code: 'custom',
          path: ['transferAccountId'],
          message: 'Destination account is required',
        });
      } else if (data.transferAccountId === data.accountId) {
        ctx.addIssue({
          code: 'custom',
          path: ['transferAccountId'],
          message: 'Pick a different destination account',
        });
      }
      return;
    }

    if (!data.category) {
      ctx.addIssue({
        code: 'custom',
        path: ['category'],
        message: 'Category is required',
      });
    }
  });

export type TransactionValues = z.input<typeof transactionSchema>;
