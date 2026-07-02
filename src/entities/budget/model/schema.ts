import { CATEGORY_TYPES } from '@/entities/category';
import { DateValue } from 'react-aria-components';
import z from 'zod';
import { PERIOD_VALUES } from './types';

export const budgetSchema = z.object({
  name: z.string({error: 'Name is required'}),
  amount: z.number().positive({error: 'Number should be above 0'}),
  period: z.enum(PERIOD_VALUES),
  category: z.enum(CATEGORY_TYPES),
})

export type budgetData= z.infer<typeof budgetSchema>;