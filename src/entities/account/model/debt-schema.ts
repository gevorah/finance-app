import { DateValue } from 'react-aria-components';
import { z } from 'zod';

import { ACCOUNT_KINDS } from './types';

const dayOfMonth = z
  .number()
  .int()
  .min(1, { error: 'Day should be between 1 and 31' })
  .max(31, { error: 'Day should be between 1 and 31' });

const requiredDate = (message: string) =>
  z.custom<DateValue>((val) => val !== undefined && val !== null, {
    error: message,
  });

const interestSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('none') }),
  z.object({
    type: z.literal('fixed'),
    rate: z.number().min(0, { error: 'Rate should be 0 or above' }),
    period: z.enum(['monthly', 'yearly']),
  }),
  z.object({
    type: z.literal('variable'),
    rate: z.number().min(0, { error: 'Rate should be 0 or above' }),
    period: z.enum(['monthly', 'yearly']),
    referenceRate: z.string().optional(),
  }),
]);

const paymentTermsSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('installments'),
    installmentAmount: z
      .number()
      .positive({ error: 'Installment amount should be above 0' }),
    totalInstallments: z.number().int().positive().optional(),
    frequency: z.enum(['weekly', 'monthly', 'yearly', 'custom']),
    nextPaymentDueDate: requiredDate('Next payment due date is required')
      .optional(),
  }),
  z.object({
    type: z.literal('revolving'),
    minimumPayment: z
      .number()
      .positive({ error: 'Minimum payment should be above 0' })
      .optional(),
    nextPaymentDueDate: requiredDate('Next payment due date is required')
      .optional(),
  }),
  z.object({
    type: z.literal('flexible'),
    suggestedPaymentAmount: z
      .number()
      .positive({ error: 'Suggested payment should be above 0' })
      .optional(),
    nextPaymentDueDate: requiredDate('Next payment due date is required')
      .optional(),
  }),
]);

/**
 * The amount owed is the opening balance of the liability account, so the form
 * asks for it once instead of asking for an original and a current amount.
 */
export const debtSchema = z.object({
  name: z.string().min(1, { error: 'Creditor is required' }),
  kind: z.enum([
    ACCOUNT_KINDS.CREDIT_CARD,
    ACCOUNT_KINDS.LOAN,
    ACCOUNT_KINDS.MORTGAGE,
    ACCOUNT_KINDS.VEHICLE,
    ACCOUNT_KINDS.STUDENT,
    ACCOUNT_KINDS.PERSONAL,
  ]),
  amountOwed: z.number().positive({ error: 'Amount owed should be above 0' }),
  creditLimit: z
    .number()
    .positive({ error: 'Credit limit should be above 0' })
    .optional(),
  cutOffDay: dayOfMonth.optional(),
  startDate: requiredDate('Start date is required'),
  description: z.string().optional(),
  interest: interestSchema,
  paymentTerms: paymentTermsSchema,
});

export type DebtValues = z.infer<typeof debtSchema>;
