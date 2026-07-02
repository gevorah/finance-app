'use client';

import { Budget, PERIOD_OPTIONS } from '@/entities/budget';
import { budgetData, budgetSchema } from '@/entities/budget/model/schema';
import { CATEGORY_OPTIONS } from '@/entities/category';
import { Button } from '@/shared/components/ui/button';
import { NumberField } from '@/shared/components/ui/number-field';
import { Select, SelectItem } from '@/shared/components/ui/select';
import { TextField } from '@/shared/components/ui/text-field';
import { useBudgetStore } from '@/stores/budgetStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

interface BudgetFormProps {
  budgetInfo?: Budget;
}

export default function BudgetForm({ budgetInfo }: BudgetFormProps) {
  const { control, handleSubmit } = useForm<budgetData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: budgetInfo || undefined,
  });
  const router = useRouter();
  const { addBudget, updateBudget } = useBudgetStore();
  const onSubmit: SubmitHandler<budgetData> = (data) => {
    const budgetData = {
      name: data.name,
      monthlyLimit: data.amount,
      period: data.period,
      category: data.category,
    };

    if (budgetInfo) {
      updateBudget(budgetInfo.id, budgetData);
    } else {
      addBudget(budgetData);
    }

    router.push('/budgets');
  };
  return (
    <main>
      <section>
        <h1 className="form-container__title">
          {budgetInfo ? 'Edit Budget' : 'New Budget'}
        </h1>
        <form className="budget-form" onSubmit={handleSubmit(onSubmit, (errors) => console.log('Validation errors:', errors))}>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                label="Category Name"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="amount"
            control={control}
            render={({ field, fieldState }) => (
              <NumberField
                label="Budget Amount"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="period"
            control={control}
            render={({ field, fieldState }) => (
              <Select
                label="period"
                placeholder="Select a period"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                items={PERIOD_OPTIONS}
                errorMessage={fieldState.error?.message}
              >
                {(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}
              </Select>
            )}
          />
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
                items={CATEGORY_OPTIONS}
                errorMessage={fieldState.error?.message}
              >
                {(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}
              </Select>
            )}
          />
          <div className="buttons-container">
            <Button
              variant={'secondary'}
              size={'large'}
              border={true}
              className="buttons-container__btn-cancel"
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
