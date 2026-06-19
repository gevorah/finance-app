import { CATEGORY_OPTIONS } from '@/entities/category';
import { Transaction } from '@/entities/transaction';
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
import { parseDate } from '@internationalized/date';
import { useRouter } from 'next/navigation';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import './TransactionForm.scss';

interface TransactionFormProps {
  initialData?: Transaction;
}
export default function TransactionForm({ initialData }: TransactionFormProps) {
  const { handleSubmit, control } = useForm<TransactionValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialData
      ? { ...initialData, date: parseDate(initialData.date) }
      : undefined,
  });
  const router = useRouter();
  const { addTransaction, updateTransaction } = useTransactionStore();
  const onSubmit: SubmitHandler<TransactionValues> = (data) => {
    const transactionData = {
      type: data.type,
      amount: Number(data.amount),
      category: data.category,
      description: data.description,
      date: data.date.toString(),
    };
    if (initialData) {
      updateTransaction(initialData.id, transactionData);
    } else {
      addTransaction(transactionData);
    }
    router.push('/transactions');
  };
  return (
    <main className="transaction-container">
      <section className="form-container">
        <h1 className="form-container__title">{initialData ? 'Edit Transaction' : 'New Transaction'}</h1>
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
              {initialData ? 'Update Transaction' : 'Save Transaction'}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
