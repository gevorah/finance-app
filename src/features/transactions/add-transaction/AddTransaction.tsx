'use client';

import './AddTransaction.scss';

import { Button } from '@/shared/components/ui/button';
import { DatePicker } from '@/shared/components/ui/date-picker';
import { NumberField } from '@/shared/components/ui/number-field';
import { TextField } from '@/shared/components/ui/text-field';
import { Toggle, ToggleButtonGroup } from '@/shared/components/ui/toggle';
import { useTransactionStore } from '@/stores/transactionStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { DateValue } from 'react-aria-components';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { CATEGORY_TYPES } from '../types';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive({ error: 'Amount should be above 0' }),
  category: z.enum(CATEGORY_TYPES),
  description: z.string({ error: 'Description is required' }),
  date: z.custom<DateValue>((val) => val !== undefined, {
    error: 'Date is required',
  }),
});

type FormInput = z.input<typeof transactionSchema>;

export default function AddTransaction() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(transactionSchema),
  });
  const { addTransaction } = useTransactionStore();
  const onSubmit: SubmitHandler<FormInput> = (data) => {
    addTransaction({
      type: data.type,
      amount: Number(data.amount),
      category: data.category,
      description: data.description,
      date: data.date,
    });
    console.log(data);
  };
  return (
    <main className="add-transaction-container">
      <div className="back-section">
        <Button variant={'secondary'} size={'small'}>
          <ArrowLeft /> <span>Back</span>
        </Button>
      </div>
      <section className="form-container">
        <h1 className="form-container__title">New Transaction</h1>
        <Controller
          name="type"
          control={control}
          defaultValue="expense"
          render={({ field }) => (
            <ToggleButtonGroup
              className="type-toggle"
              selectedKeys={new Set([field.value])}
              onSelectionChange={(keys) => {
                const selected = [...keys][0] as FormInput['type'];
                field.onChange(selected);
              }}
            >
              <Toggle id="expense" className="toggle-expense">Expense</Toggle>
              <Toggle id="income" className="toggle-income">Income</Toggle>
            </ToggleButtonGroup>
          )}
        />
        <form className="transaction-form" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="amount"
            control={control}
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <NumberField
                label="Amount"
                errorMessage={fieldState.error?.message}
                {...field}
              />
            )}
          />
          <label className="transaction-form__category">Category</label>
          <select {...register('category')}>
            <option value="" disabled>
              Select Category
            </option>
            {Object.values(CATEGORY_TYPES).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.category && (
            <span className="error-message">{errors.category.message}</span>
          )}
          <Controller
            name="description"
            control={control}
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <TextField
                label="Description"
                errorMessage={fieldState.error?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="date"
            control={control}
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <DatePicker
                label="Date"
                errorMessage={fieldState.error?.message}
                {...field}
              />
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
              Save Transaction
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
