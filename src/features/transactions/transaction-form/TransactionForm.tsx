'use client';

import {
  ACCOUNT_ROOTS,
  getAccountsByRoot,
  getRealAccounts,
  useAccountsById,
  useAccountStore,
} from '@/entities/account';
import {
  buildPostings,
  describeTransaction,
  isEditableKind,
  Transaction,
  TRANSACTION_KINDS,
  transactionSchema,
  TransactionValues,
  useTransactionStore,
} from '@/entities/transaction';
import { Button } from '@/shared/components/ui/button';
import { DatePicker } from '@/shared/components/ui/date-picker';
import { NumberField } from '@/shared/components/ui/number-field';
import { Select, SelectItem } from '@/shared/components/ui/select';
import { TextField } from '@/shared/components/ui/text-field';
import { Toggle, ToggleButtonGroup } from '@/shared/components/ui/toggle';
import { toMajorUnits, toMinorUnits } from '@/shared/lib/money';
import { zodResolver } from '@hookform/resolvers/zod';
import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
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

  const realAccounts = getRealAccounts(accounts);
  const expenseAccounts = getAccountsByRoot(accounts, ACCOUNT_ROOTS.EXPENSES);
  const incomeAccounts = getAccountsByRoot(accounts, ACCOUNT_ROOTS.INCOME);

  const accountsById = useAccountsById();

  const initialView = initialData
    ? describeTransaction(initialData, accountsById)
    : undefined;

  const editableKind = isEditableKind(initialView?.kind)
    ? initialView!.kind
    : TRANSACTION_KINDS.EXPENSE;

  const { handleSubmit, control } = useForm<TransactionValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      initialData && initialView
        ? {
            kind: editableKind,
            amount: toMajorUnits(initialView.amount),
            accountId: initialView.accountId,
            counterAccountId: initialView.counterAccountId,
            description: initialData.description,
            date: parseDate(initialData.date),
          }
        : {
            kind: TRANSACTION_KINDS.EXPENSE,
            accountId: realAccounts[0]?.id,
            counterAccountId: expenseAccounts[0]?.id,
            description: '',
            date: today(getLocalTimeZone()),
          },
  });

  const kind = useWatch({ control, name: 'kind' });
  const isTransfer = kind === TRANSACTION_KINDS.TRANSFER;

  const counterAccounts = isTransfer
    ? realAccounts
    : kind === TRANSACTION_KINDS.INCOME
      ? incomeAccounts
      : expenseAccounts;

  const onSubmit: SubmitHandler<TransactionValues> = (data) => {
    const transaction = {
      description: data.description,
      date: data.date.toString(),
      postings: buildPostings({
        kind: data.kind,
        amount: toMinorUnits(Number(data.amount)),
        accountId: data.accountId,
        counterAccountId: data.counterAccountId,
      }),
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
          name="kind"
          control={control}
          render={({ field }) => (
            <ToggleButtonGroup
              className="type-toggle"
              selectedKeys={new Set([field.value])}
              onSelectionChange={(keys) => {
                field.onChange([...keys][0] as TransactionValues['kind']);
              }}
            >
              <Toggle id={TRANSACTION_KINDS.EXPENSE} className="toggle-expense">
                Expense
              </Toggle>
              <Toggle id={TRANSACTION_KINDS.INCOME} className="toggle-income">
                Income
              </Toggle>
              <Toggle
                id={TRANSACTION_KINDS.TRANSFER}
                className="toggle-transfer"
              >
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
                items={realAccounts}
                errorMessage={fieldState.error?.message}
              >
                {(item) => <SelectItem id={item.id}>{item.name}</SelectItem>}
              </Select>
            )}
          />
          <Controller
            name="counterAccountId"
            control={control}
            render={({ field, fieldState }) => (
              <Select
                label={isTransfer ? 'To account' : 'Category'}
                placeholder={isTransfer ? 'Select account' : 'Select category'}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                items={counterAccounts}
                errorMessage={fieldState.error?.message}
              >
                {(item) => <SelectItem id={item.id}>{item.name}</SelectItem>}
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
