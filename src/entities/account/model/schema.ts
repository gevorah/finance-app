import { DateValue } from 'react-aria-components';
import { z } from 'zod';

import { ACCOUNT_KINDS, ACCOUNT_ROOTS, getRootForKind } from './types';

const dayOfMonth = z
  .number()
  .int()
  .min(1, { error: 'Day should be between 1 and 31' })
  .max(31, { error: 'Day should be between 1 and 31' });

const rate = z.number().min(0, { error: 'Rate should be 0 or above' });

const interestSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('none') }),
  z.object({
    type: z.literal('fixed'),
    rate,
    period: z.enum(['monthly', 'yearly']),
  }),
  z.object({
    type: z.literal('variable'),
    rate,
    period: z.enum(['monthly', 'yearly']),
    referenceRate: z.string().optional(),
  }),
]);

const dueDate = z.custom<DateValue>().optional();

const paymentTermsSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('installments'),
    installmentAmount: z
      .number()
      .positive({ error: 'Installment amount should be above 0' }),
    totalInstallments: z.number().int().positive().optional(),
    frequency: z.enum(['weekly', 'monthly', 'yearly', 'custom']),
    nextPaymentDueDate: dueDate,
  }),
  z.object({
    type: z.literal('revolving'),
    minimumPayment: z
      .number()
      .positive({ error: 'Minimum payment should be above 0' })
      .optional(),
    nextPaymentDueDate: dueDate,
  }),
  z.object({
    type: z.literal('flexible'),
    suggestedPaymentAmount: z
      .number()
      .positive({ error: 'Suggested payment should be above 0' })
      .optional(),
    nextPaymentDueDate: dueDate,
  }),
]);

/**
 * Only name, kind, opening balance and budget placement are needed to open an
 * account. Everything below them describes a debt and can be filled in later
 * from the account itself, so none of it is required to create one.
 */
export const accountSchema = z
  .object({
    name: z.string().min(1, { error: 'Name is required' }),
    kind: z.enum(ACCOUNT_KINDS),
    onBudget: z.boolean(),
    openingBalance: z.number().optional(),
    description: z.string().optional(),
    creditLimit: z
      .number()
      .positive({ error: 'Credit limit should be above 0' })
      .optional(),
    cutOffDay: dayOfMonth.optional(),
    paymentDueDay: dayOfMonth.optional(),
    interest: interestSchema.optional(),
    paymentTerms: paymentTermsSchema.optional(),
  })
  .refine(
    (data) =>
      getRootForKind(data.kind) !== ACCOUNT_ROOTS.LIABILITIES ||
      (data.openingBalance ?? 0) >= 0,
    {
      error: 'Enter what you owe as a positive amount',
      path: ['openingBalance'],
    },
  );

export type AccountValues = z.infer<typeof accountSchema>;
