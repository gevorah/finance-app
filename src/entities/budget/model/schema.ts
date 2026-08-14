import z from 'zod';

export const budgetSchema = z.object({
  accountId: z.string().min(1, { error: 'Category is required' }),
  monthlyLimit: z.number().positive({ error: 'Amount should be above 0' }),
});

export type BudgetValues = z.infer<typeof budgetSchema>;
