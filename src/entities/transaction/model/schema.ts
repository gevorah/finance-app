import { DateValue } from 'react-aria-components';
import z from 'zod';

import { TRANSACTION_KINDS } from './types';

/**
 * The form speaks the user's language — expense, income, transfer, one amount
 * in pesos — and the ledger turns it into balanced postings on submit.
 */
export const transactionSchema = z
  .object({
    kind: z.enum([
      TRANSACTION_KINDS.EXPENSE,
      TRANSACTION_KINDS.INCOME,
      TRANSACTION_KINDS.TRANSFER,
    ]),
    amount: z.number().positive({ error: 'Amount should be above 0' }),
    accountId: z.string().min(1, { error: 'Account is required' }),
    counterAccountId: z.string().min(1, { error: 'Category is required' }),
    description: z.string().min(1, { error: 'Description is required' }),
    date: z.custom<DateValue>((val) => val !== undefined && val !== null, {
      error: 'Date is required',
    }),
  })
  .refine(
    (data) =>
      data.kind !== TRANSACTION_KINDS.TRANSFER ||
      data.accountId !== data.counterAccountId,
    {
      error: 'Pick a different destination account',
      path: ['counterAccountId'],
    },
  );

export type TransactionValues = z.input<typeof transactionSchema>;
