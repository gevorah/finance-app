import { DateValue } from 'react-aria-components';
import { z } from 'zod';

const requiredDate = (message: string) =>
  z.custom<DateValue>((val) => val !== undefined && val !== null, {
    error: message,
  });

const dayOfMonthSchema = z
  .number()
  .int()
  .min(1, { error: 'Day should be between 1 and 31' })
  .max(31, { error: 'Day should be between 1 and 31' });

const interestSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('none'),
  }),
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
    paidInstallments: z.number().int().min(0).optional(),
    frequency: z.enum(['weekly', 'monthly', 'yearly', 'custom']),
    nextPaymentDueDate: requiredDate(
      'Next payment due date is required',
    ).optional(),
  }),
  z.object({
    type: z.literal('revolving'),
    minimumPayment: z
      .number()
      .positive({ error: 'Minimum payment should be above 0' })
      .optional(),
    statementBalance: z
      .number()
      .min(0, { error: 'Statement balance should be 0 or above' })
      .optional(),
    cutOffDay: dayOfMonthSchema.optional(),
    nextPaymentDueDate: requiredDate(
      'Next payment due date is required',
    ).optional(),
  }),
  z.object({
    type: z.literal('flexible'),
    suggestedPaymentAmount: z
      .number()
      .positive({ error: 'Suggested payment should be above 0' })
      .optional(),
    nextPaymentDueDate: requiredDate(
      'Next payment due date is required',
    ).optional(),
  }),
]);

export const debtSchema = z.object({
  creditorName: z.string({ error: 'Name is required' }),
  type: z.enum([
    'credit_card',
    'loan',
    'personal',
    'mortgage',
    'vehicle',
    'student',
    'other',
  ]),
  originalAmount: z
    .number()
    .positive({ error: 'Original amount should be above 0' }),
  currentBalance: z
    .number()
    .min(0, { error: 'Current balance should be 0 or above' })
    .optional(),
  interest: interestSchema,
  paymentTerms: paymentTermsSchema,
  startDate: requiredDate('Start date is required'),
  description: z.string().optional(),
  priority: z.number().int().min(1).max(5).optional(),
});

export type DebtValues = z.infer<typeof debtSchema>;
