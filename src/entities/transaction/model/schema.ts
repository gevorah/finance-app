import { Money, toMinorUnits } from '@/shared/lib/money';
import { DateValue } from 'react-aria-components';
import z from 'zod';

import { TRANSACTION_KINDS } from './types';

const amountSchema = z
  .number({ error: 'Amount is required' })
  .positive({ error: 'Amount should be above 0' });

const splitSchema = z.object({
  counterAccountId: z.string().min(1, { error: 'Category is required' }),
  amount: amountSchema,
});

export type SplitValues = z.input<typeof splitSchema>;

export function getSplitsTotal(splits: SplitValues[]): Money {
  return splits.reduce(
    (total, split) =>
      Number.isFinite(split.amount)
        ? total + toMinorUnits(split.amount)
        : total,
    0,
  );
}

export const transactionSchema = z
  .object({
    kind: z.enum([
      TRANSACTION_KINDS.EXPENSE,
      TRANSACTION_KINDS.INCOME,
      TRANSACTION_KINDS.TRANSFER,
    ]),
    amount: amountSchema,
    accountId: z.string().min(1, { error: 'Account is required' }),
    installments: z.number().min(1).optional(),
    paymentAccountId: z.string().optional(),
    counterAccountId: z.string(),
    splits: z.array(splitSchema).optional(),
    payee: z.string().optional(),
    description: z.string().optional(),
    date: z.custom<DateValue>((val) => val !== undefined && val !== null, {
      error: 'Date is required',
    }),
  })
  .superRefine((data, ctx) => {
    if (data.splits && data.splits.length > 0) {
      const partsAreValid = data.splits.every((split) => split.amount > 0);
      if (
        partsAreValid &&
        getSplitsTotal(data.splits) !== toMinorUnits(data.amount)
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['splits'],
          message: 'The parts should add up to the amount',
        });
      }
      return;
    }

    if (!data.counterAccountId) {
      ctx.addIssue({
        code: 'custom',
        path: ['counterAccountId'],
        message: 'Category is required',
      });
    }
  })
  .refine(
    (data) =>
      data.kind !== TRANSACTION_KINDS.TRANSFER ||
      data.accountId !== data.counterAccountId,
    {
      error: 'Pick a different destination account',
      path: ['counterAccountId'],
    },
  )
  .refine((data) => data.payee || data.description, {
    error: 'Either payee or description is required',
    path: ['description'],
  });

export type TransactionValues = z.input<typeof transactionSchema>;
