import { z } from 'zod';

import { ACCOUNT_KINDS, ACCOUNT_ROOTS } from './types';

const dayOfMonth = z
  .number()
  .int()
  .min(1, { error: 'Day should be between 1 and 31' })
  .max(31, { error: 'Day should be between 1 and 31' });

export const accountSchema = z
  .object({
    name: z.string().min(1, { error: 'Name is required' }),
    root: z.enum(ACCOUNT_ROOTS),
    kind: z.enum(ACCOUNT_KINDS).optional(),
    onBudget: z.boolean(),
    openingBalance: z.number().optional(),
    creditLimit: z
      .number()
      .positive({ error: 'Credit limit should be above 0' })
      .optional(),
    cutOffDay: dayOfMonth.optional(),
    paymentDueDay: dayOfMonth.optional(),
  })
  .refine(
    (data) =>
      data.kind !== ACCOUNT_KINDS.CREDIT_CARD || data.creditLimit !== undefined,
    { error: 'Credit limit is required for a card', path: ['creditLimit'] },
  );

export type AccountValues = z.infer<typeof accountSchema>;
