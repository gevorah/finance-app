'use client';

import { Budget, budgetSchema, BudgetValues } from '@/entities/budget';
import { EXPENSE_CATEGORIES } from '@/entities/category';
import { Button } from '@/shared/components/ui/button';
import { NumberField } from '@/shared/components/ui/number-field';
import { Select, SelectItem } from '@/shared/components/ui/select';
import { toMajorUnits, toMinorUnits } from '@/shared/lib/money';
import { useBudgetStore } from '@/entities/budget';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

const MONEY_FORMAT = {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 2,
} as const;

interface BudgetFormProps {
  budgetInfo?: Budget;
}

export default function BudgetForm({ budgetInfo }: BudgetFormProps) {
  const router = useRouter();
  const { addBudget, updateBudget } = useBudgetStore();

  const { control, handleSubmit } = useForm<BudgetValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: budgetInfo
      ? {
          category: budgetInfo.category,
          monthlyLimit: toMajorUnits(budgetInfo.monthlyLimit),
        }
      : undefined,
  });

  const onSubmit: SubmitHandler<BudgetValues> = (data) => {
    const budget = {
      category: data.category,
      monthlyLimit: toMinorUnits(Number(data.monthlyLimit)),
    };

    if (budgetInfo) {
      updateBudget(budgetInfo.id, budget);
    } else {
      addBudget(budget);
    }

    router.push('/budgets');
  };

  return (
    <main>
      <section>
        <h1 className="form-container__title">
          {budgetInfo ? 'Edit Budget' : 'New Budget'}
        </h1>
        <form className="budget-form" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="category"
            control={control}
            render={({ field, fieldState }) => (
              <Select
                label="Category"
                placeholder="Select Category"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                items={EXPENSE_CATEGORIES}
                errorMessage={fieldState.error?.message}
              >
                {(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}
              </Select>
            )}
          />
          <Controller
            name="monthlyLimit"
            control={control}
            render={({ field, fieldState }) => (
              <NumberField
                label="Monthly limit"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                formatOptions={MONEY_FORMAT}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
          <div className="buttons-container">
            <Button
              variant={'secondary'}
              size={'large'}
              border={true}
              className="buttons-container__btn-cancel"
              onPress={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              variant={'primary'}
              size={'large'}
              type="submit"
              className="buttons-container__btn-save"
            >
              {budgetInfo ? 'Update Budget' : 'Save Budget'}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
