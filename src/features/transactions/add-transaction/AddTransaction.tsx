'use client';

import { CATEGORY_OPTIONS } from '@/entities/category';

import './AddTransaction.scss';

import {
  transactionSchema,
  TransactionValues,
} from '@/entities/transaction/model/schema';
import { Button } from '@/shared/components/ui/button';
import { DatePicker } from '@/shared/components/ui/date-picker';
import { NumberField } from '@/shared/components/ui/number-field';
import { Select, SelectItem } from '@/shared/components/ui/select';
import { TextField } from '@/shared/components/ui/text-field';
import { Toggle, ToggleButtonGroup } from '@/shared/components/ui/toggle';
import { useTransactionStore } from '@/stores/transactionStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

export default function AddTransaction() {
  const { handleSubmit, control } = useForm<TransactionValues>({
    resolver: zodResolver(transactionSchema),
  });
  const { addTransaction } = useTransactionStore();
  const router = useRouter();
  const onSubmit: SubmitHandler<TransactionValues> = (data) => {
    addTransaction({
      type: data.type,
      amount: Number(data.amount),
      category: data.category,
      description: data.description,
      date: data.date.toString(),
    });
    console.log(data);
  };
  return (
    <main className="add-transaction-container">
      <div className="back-section">
        <Button variant={'secondary'} size={'small'} onPress={() => router.back()}>
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
                const selected = [...keys][0] as TransactionValues['type'];
                field.onChange(selected);
              }}
            >
              <Toggle id="expense" className="toggle-expense">
                Expense
              </Toggle>
              <Toggle id="income" className="toggle-income">
                Income
              </Toggle>
            </ToggleButtonGroup>
          )}
        />
        <form className="transaction-form" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="amount"
            control={control}
            render={({ field, fieldState }) => (
              <NumberField
                label="Amount"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                errorMessage={fieldState.error?.message}
              />
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
          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                label="Description"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="date"
            control={control}
            render={({ field, fieldState }) => (
              <DatePicker
                label="Date"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
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
