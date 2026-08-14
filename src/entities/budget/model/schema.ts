import { CATEGORY_TYPES, getCategoryKind } from '@/entities/category';
import z from 'zod';

export const budgetSchema = z.object({
  category: z
    .enum(CATEGORY_TYPES, { error: 'Category is required' })
    .refine((id) => getCategoryKind(id) === 'expense', {
      error: 'Budgets only apply to expense categories',
    }),
  monthlyLimit: z.number().positive({ error: 'Amount should be above 0' }),
});

export type BudgetValues = z.infer<typeof budgetSchema>;
