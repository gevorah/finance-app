'use client';

import { getCategoriesByKind } from '@/entities/category';
import {
  Transaction,
  transactionSchema,
  TransactionValues,
} from '@/entities/transaction';
import { Button } from '@/shared/components/ui/button';
import { DatePicker } from '@/shared/components/ui/date-picker';
import { NumberField } from '@/shared/components/ui/number-field';
import { Select, SelectItem } from '@/shared/components/ui/select';
import { TextField } from '@/shared/components/ui/text-field';
import { Toggle, ToggleButtonGroup } from '@/shared/components/ui/toggle';
import { toMinorUnits, toMajorUnits } from '@/shared/lib/money';
import { useAccountStore } from '@/entities/account';
import { useTransactionStore } from '@/entities/transaction';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  getLocalTimeZone,
  parseDate,
  today,
} from '@internationalized/date';
import { useRouter } from 'next/navigation';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';

import './TransactionForm.scss';

const MONEY_FORMAT = {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 2,
} as const;

interface TransactionFormProps {
  initialData?: Transaction;
}

export default function TransactionForm({ initialData }: TransactionFormProps) {
  const router = useRouter();
  const { accounts } = useAccountStore();
  const { addTransaction, updateTransaction } = useTransactionStore();
  const activeAccounts = accounts.filter((account) => !account.archived);

  const { handleSubmit, control } = useForm<TransactionValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          amount: toMajorUnits(initialData.amount),
          date: parseDate(initialData.date),
        }
      : {
          type: 'expense',
          accountId: activeAccounts[0]?.id,
          date: today(getLocalTimeZone()),
          description: '',
        },
  });

  const type = useWatch({ control, name: 'type' });
  const isTransfer = type === 'transfer';
  const categories = getCategoriesByKind(type === 'income' ? 'income' : 'expense');

  const onSubmit: SubmitHandler<TransactionValues> = (data) => {
    const transaction = {
      type: data.type,
      accountId: data.accountId,
      transferAccountId: isTransfer ? data.transferAccountId : undefined,
      category: isTransfer ? undefined : data.category,
      amount: toMinorUnits(Number(data.amount)),
      description: data.description,
      date: data.date.toString(),
    };

    if (initialData) {
      updateTransaction(initialData.id, transaction);
    } else {
      addTransaction(transaction);
    }

    router.push('/transactions');
  };

  return (
    <main className="transaction-container">
      <section className="form-container">
        <h1 className="form-container__title">
          {initialData ? 'Edit Transaction' : 'New Transaction'}
        </h1>
        <Controller
          name="type"
          control={control}
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
              <Toggle id="transfer" className="toggle-transfer">
                Transfer
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
                formatOptions={MONEY_FORMAT}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="accountId"
            control={control}
            render={({ field, fieldState }) => (
              <Select
                label={isTransfer ? 'From account' : 'Account'}
                placeholder="Select account"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                items={activeAccounts}
                errorMessage={fieldState.error?.message}
              >
                {(item) => <SelectItem id={item.id}>{item.name}</SelectItem>}
              </Select>
            )}
          />
          {isTransfer ? (
            <Controller
              name="transferAccountId"
              control={control}
              render={({ field, fieldState }) => (
                <Select
                  label="To account"
                  placeholder="Select account"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  items={activeAccounts}
                  errorMessage={fieldState.error?.message}
                >
                  {(item) => <SelectItem id={item.id}>{item.name}</SelectItem>}
                </Select>
              )}
            />
          ) : (
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
                  items={categories}
                  errorMessage={fieldState.error?.message}
                >
                  {(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}
                </Select>
              )}
            />
          )}
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
              {initialData ? 'Update Transaction' : 'Save Transaction'}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
