'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ACCOUNT_KINDS,
  ACCOUNT_ROOTS,
  getAccountsByRoot,
  getRealAccounts,
  useAccountsById,
  useAccountStore,
} from '@/entities/account';
import {
  buildPostings,
  buildSplitPostings,
  describeTransaction,
  getAccountSuggestions,
  getPayees,
  getPayeeSuggestion,
  getSplitsTotal,
  isEditableKind,
  SplitValues,
  Transaction,
  TRANSACTION_KINDS,
  transactionSchema,
  TransactionValues,
  useTransactionStore,
} from '@/entities/transaction';
import { Button } from '@/shared/components/ui/button';
import { ComboBox, ComboBoxItem } from '@/shared/components/ui/combo-box';
import { DatePicker } from '@/shared/components/ui/date-picker';
import {
  Disclosure,
  DisclosureHeader,
  DisclosurePanel,
} from '@/shared/components/ui/disclosure';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { NumberField } from '@/shared/components/ui/number-field';
import { Select, SelectItem } from '@/shared/components/ui/select';
import { TextField } from '@/shared/components/ui/text-field';
import { Toggle, ToggleButtonGroup } from '@/shared/components/ui/toggle';
import { formatCurrency } from '@/shared/lib/currency';
import { toMajorUnits, toMinorUnits } from '@/shared/lib/money';
import { zodResolver } from '@hookform/resolvers/zod';
import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
import { Plus, Wallet, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Controller,
  SubmitErrorHandler,
  SubmitHandler,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form';

import './TransactionForm.scss';

import { calculateInstallment } from '@/features/installements/calculateInstallment';

const MONEY_FORMAT = {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 2,
} as const;

const emptySplit = (counterAccountId = ''): SplitValues =>
  ({ counterAccountId }) as SplitValues;

function describeRemainder(total: number | undefined, assigned: number) {
  if (total === undefined || !Number.isFinite(total)) return '';
  const remainder = toMinorUnits(total) - assigned;
  if (remainder > 0) return `${formatCurrency(remainder)} left to assign`;
  if (remainder < 0) return `${formatCurrency(-remainder)} over the amount`;
  return '';
}

interface TransactionFormProps {
  initialData?: Transaction;
}

export default function TransactionForm({ initialData }: TransactionFormProps) {
  const router = useRouter();
  const { accounts } = useAccountStore();
  const { transactions, addTransaction, updateTransaction } =
    useTransactionStore();

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

  const { handleSubmit, control, setValue, getValues, setFocus, formState } =
    useForm<TransactionValues>({
      resolver: zodResolver(transactionSchema),
      defaultValues:
        initialData && initialView
          ? {
              kind: editableKind,
              amount: toMajorUnits(initialView.amount),
              accountId: initialView.accountId,
              counterAccountId: initialView.counterAccountId,
              splits: initialView.isSplit
                ? initialView.counterPostings.map((posting) => ({
                    counterAccountId: posting.accountId,
                    amount: toMajorUnits(Math.abs(posting.amount)),
                  }))
                : [],
              payee: initialData.payee ?? '',
              description: initialData.description,
              date: parseDate(initialData.date),
            }
          : {
              kind: TRANSACTION_KINDS.EXPENSE,
              accountId:
                getAccountSuggestions(transactions, accountsById) ??
                realAccounts[0]?.id,
              counterAccountId: expenseAccounts[0]?.id,
              splits: [],
              payee: '',
              description: '',
              date: today(getLocalTimeZone()),
            },
    });

  const kind = useWatch({ control, name: 'kind' });
  const isTransfer = kind === TRANSACTION_KINDS.TRANSFER;

  const accountId = useWatch({ control, name: 'accountId' });
  const selectedAccount = accountsById.get(accountId);
  const isCreditCard = selectedAccount?.kind === ACCOUNT_KINDS.CREDIT_CARD;

  const counterAccounts = isTransfer
    ? realAccounts
    : kind === TRANSACTION_KINDS.INCOME
      ? incomeAccounts
      : expenseAccounts;

  const payees = getPayees(transactions);

  const {
    fields: splitFields,
    append: appendSplit,
    remove: removeSplit,
    replace: replaceSplits,
  } = useFieldArray({ control, name: 'splits' });
  const isSplit = splitFields.length > 0;

  const amount = useWatch({ control, name: 'amount' });
  const splits = useWatch({ control, name: 'splits' });
  const remainder = isSplit
    ? describeRemainder(amount, getSplitsTotal(splits ?? []))
    : '';

  const startSplit = () => {
    replaceSplits([emptySplit(getValues('counterAccountId')), emptySplit()]);
  };

  const focusSingleCategory = useRef(false);

  useEffect(() => {
    if (isSplit || !focusSingleCategory.current) return;
    focusSingleCategory.current = false;
    setFocus('counterAccountId');
  }, [isSplit, setFocus]);

  const removeSplitAt = (index: number) => {
    if (splitFields.length > 2) {
      const survivor = index < splitFields.length - 1 ? index + 1 : index - 1;
      setFocus(`splits.${survivor}.counterAccountId`);
      removeSplit(index);
      return;
    }
    const remaining = getValues('splits')?.find((_, i) => i !== index);
    setValue('counterAccountId', remaining?.counterAccountId ?? '');
    focusSingleCategory.current = true;
    replaceSplits([]);
  };

  const [detailsOpen, setDetailsOpen] = useState(Boolean(initialData));
  const [suggestedFrom, setSuggestedFrom] = useState('');

  const applyPayeeSuggestion = (payee: string) => {
    const suggestion = getPayeeSuggestion(payee, transactions, accountsById);
    if (!suggestion) return;

    let applied = false;
    if (!formState.dirtyFields.accountId) {
      setValue('accountId', suggestion.accountId);
      applied = true;
    }
    if (!isSplit && !formState.dirtyFields.counterAccountId) {
      setValue('counterAccountId', suggestion.counterAccountId);
      applied = true;
    }

    if (applied) setSuggestedFrom(payee.trim());
  };

  const onInvalid: SubmitErrorHandler<TransactionValues> = (errors) => {
    if (errors.description || errors.date) setDetailsOpen(true);
  };

  const onSubmit: SubmitHandler<TransactionValues> = (data) => {
    const transaction = {
      payee: data.payee?.trim() || undefined,
      description: data.description || data.payee || '',
      date: data.date.toString(),
      postings: data.splits?.length
        ? buildSplitPostings(
            {
              accountId: data.accountId,
              splits: data.splits.map((split) => ({
                counterAccountId: split.counterAccountId,
                amount: toMinorUnits(Number(split.amount)),
              })),
            },
            accountsById,
          )
        : buildPostings(
            {
              amount: toMinorUnits(Number(data.amount)),
              accountId: data.accountId,
              counterAccountId: data.counterAccountId,
            },
            accountsById,
          ),
    };

    if (initialData) {
      updateTransaction(initialData.id, transaction);
    } else {
      addTransaction(transaction);
    }

    if (isCreditCard && data.installments && data.installments > 1 && data.paymentAccountId) {
      const installmentAmount = calculateInstallment(
        data.amount,
        data.installments,
      );
      for (let i = 1; i <= data.installments; i++) {
        addTransaction({
          description: `Installment ${i}/${data.installments} — ${data.description || data.payee || ''}`,
          date: data.date.add({ months: i }).toString(),
          postings: buildPostings(
            {
              amount: toMinorUnits(installmentAmount),
              accountId: data.paymentAccountId,
              counterAccountId: data.accountId,
            },
            accountsById,
          ),
        });
      }
    }

    router.push('/transactions');
  };

  if (realAccounts.length === 0) {
    return (
      <EmptyState
        icon={<Wallet size={28} />}
        title="No account to register this against"
        description="Every movement leaves or arrives somewhere, so add an account first."
        action={
          <Button
            variant="primary"
            size="small"
            onPress={() => router.push('/accounts/new')}
          >
            Add account
          </Button>
        }
      />
    );
  }

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
                const next = [...keys][0] as TransactionValues['kind'];
                if (next === TRANSACTION_KINDS.TRANSFER) replaceSplits([]);
                field.onChange(next);
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
        <form
          className="transaction-form"
          onSubmit={handleSubmit(onSubmit, onInvalid)}
        >
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
            name="payee"
            control={control}
            render={({ field, fieldState }) => (
              <ComboBox
                label="Payee"
                placeholder="Where was it"
                name={field.name}
                allowsCustomValue
                inputValue={field.value ?? ''}
                onInputChange={field.onChange}
                onChange={(key) => {
                  if (key === null) return;
                  field.onChange(String(key));
                  applyPayeeSuggestion(String(key));
                }}
                onBlur={() => applyPayeeSuggestion(field.value ?? '')}
                items={payees.map((payee) => ({ id: payee }))}
                errorMessage={fieldState.error?.message}
              >
                {(item) => <ComboBoxItem id={item.id}>{item.id}</ComboBoxItem>}
              </ComboBox>
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
                onChange={(value) => {
                  setSuggestedFrom('');
                  field.onChange(value);
                }}
                items={realAccounts}
                errorMessage={fieldState.error?.message}
              >
                {(item) => <SelectItem id={item.id}>{item.name}</SelectItem>}
              </Select>
            )}
          />
          {isCreditCard && (
            <>
              <Controller
                name="installments"
                control={control}
                render={({ field, fieldState }) => (
                  <NumberField
                    label="Installments"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="paymentAccountId"
                control={control}
                render={({ field, fieldState }) => (
                  <Select
                    label="Pay from"
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
            </>
          )}
          {isSplit ? (
            <fieldset className="transaction-form__splits">
              <legend className="transaction-form__legend">Categories</legend>
              {splitFields.map((splitField, index) => (
                <fieldset
                  key={splitField.id}
                  className="transaction-form__split"
                >
                  <legend className="transaction-form__legend">
                    Part {index + 1}
                  </legend>
                  <Controller
                    name={`splits.${index}.counterAccountId`}
                    control={control}
                    render={({ field, fieldState }) => (
                      <Select
                        label="Category"
                        placeholder="Select category"
                        name={field.name}
                        inputRef={field.ref}
                        value={field.value}
                        onChange={field.onChange}
                        items={counterAccounts}
                        errorMessage={fieldState.error?.message}
                      >
                        {(item) => (
                          <SelectItem id={item.id}>{item.name}</SelectItem>
                        )}
                      </Select>
                    )}
                  />
                  <Controller
                    name={`splits.${index}.amount`}
                    control={control}
                    render={({ field, fieldState }) => (
                      <NumberField
                        label="Amount"
                        name={field.name}
                        inputRef={field.ref}
                        value={field.value}
                        onChange={field.onChange}
                        formatOptions={MONEY_FORMAT}
                        errorMessage={fieldState.error?.message}
                      />
                    )}
                  />
                  <Button
                    variant="secondary"
                    size="small"
                    border
                    className="transaction-form__split-remove"
                    aria-label={`Remove part ${index + 1}`}
                    onPress={() => removeSplitAt(index)}
                  >
                    <X size={16} aria-hidden="true" />
                  </Button>
                </fieldset>
              ))}
              <p
                className="transaction-form__suggestion"
                role="status"
                aria-live="polite"
              >
                {remainder}
              </p>
              {formState.errors.splits?.root?.message && (
                <p className="transaction-form__error" role="alert">
                  {formState.errors.splits.root.message}
                </p>
              )}
              <Button
                variant="secondary"
                size="small"
                border
                className="transaction-form__split-action"
                onPress={() => appendSplit(emptySplit())}
              >
                <Plus size={16} aria-hidden="true" />{' '}
                <span>Add another category</span>
              </Button>
            </fieldset>
          ) : (
            <>
              <Controller
                name="counterAccountId"
                control={control}
                render={({ field, fieldState }) => (
                  <Select
                    label={isTransfer ? 'To account' : 'Category'}
                    placeholder={
                      isTransfer ? 'Select account' : 'Select category'
                    }
                    name={field.name}
                    inputRef={field.ref}
                    value={field.value}
                    onChange={(value) => {
                      setSuggestedFrom('');
                      field.onChange(value);
                    }}
                    items={counterAccounts}
                    errorMessage={fieldState.error?.message}
                  >
                    {(item) => (
                      <SelectItem id={item.id}>{item.name}</SelectItem>
                    )}
                  </Select>
                )}
              />
              {!isTransfer && (
                <Button
                  variant="secondary"
                  size="small"
                  border
                  className="transaction-form__split-action"
                  onPress={startSplit}
                >
                  Split across categories
                </Button>
              )}
            </>
          )}
          <p
            className="transaction-form__suggestion"
            role="status"
            aria-live="polite"
          >
            {suggestedFrom &&
              `Account and category suggested from ${suggestedFrom}`}
          </p>
          <Disclosure
            isExpanded={detailsOpen}
            onExpandedChange={setDetailsOpen}
          >
            <DisclosureHeader>Description and date</DisclosureHeader>
            <DisclosurePanel className="transaction-form__details">
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
            </DisclosurePanel>
          </Disclosure>
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
