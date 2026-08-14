import { z } from 'zod';

import { ACCOUNT_TYPES } from './types';

const dayOfMonth = z
  .number()
  .int()
  .min(1, { error: 'Day should be between 1 and 31' })
  .max(31, { error: 'Day should be between 1 and 31' });

export const accountSchema = z
  .object({
    name: z.string().min(1, { error: 'Name is required' }),
    type: z.enum(ACCOUNT_TYPES),
    initialBalance: z.number({ error: 'Initial balance is required' }),
    onBudget: z.boolean(),
    creditLimit: z
      .number()
      .positive({ error: 'Credit limit should be above 0' })
      .optional(),
    cutOffDay: dayOfMonth.optional(),
    paymentDueDay: dayOfMonth.optional(),
  })
  .refine(
    (data) =>
      data.type !== ACCOUNT_TYPES.CREDIT_CARD || data.creditLimit !== undefined,
    { error: 'Credit limit is required for a card', path: ['creditLimit'] },
  );

export type AccountValues = z.infer<typeof accountSchema>;
