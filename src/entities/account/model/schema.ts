import { z } from 'zod';

import { ACCOUNT_KINDS, ACCOUNT_ROOTS, getRootForKind } from './types';

export const accountSchema = z
  .object({
    name: z.string().min(1, { error: 'Name is required' }),
    kind: z.enum(ACCOUNT_KINDS),
    onBudget: z.boolean(),
    openingBalance: z.number().optional(),
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
