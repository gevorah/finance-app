'use client';

import {
  Account,
  ACCOUNT_KIND_LABELS,
  ACCOUNT_KINDS,
  ACCOUNT_ROOTS,
  accountSchema,
  AccountValues,
  ASSET_KINDS,
  getAccountBalance,
  getRootForKind,
  LIABILITY_KINDS,
  useAccountStore,
} from '@/entities/account';
import {
  buildOpeningPostings,
  useTransactionStore,
} from '@/entities/transaction';
import { Button } from '@/shared/components/ui/button';
import { NumberField } from '@/shared/components/ui/number-field';
import { Select, SelectItem } from '@/shared/components/ui/select';
import { TextField } from '@/shared/components/ui/text-field';
import { Toggle, ToggleButtonGroup } from '@/shared/components/ui/toggle';
import { formatCurrency } from '@/shared/lib/currency';
import { toMinorUnits } from '@/shared/lib/money';
import { zodResolver } from '@hookform/resolvers/zod';
import { getLocalTimeZone, today } from '@internationalized/date';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';

import './AccountForm.scss';

const MONEY_FORMAT = {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 2,
} as const;

const BUDGET_HINTS = {
  in: 'Counts towards what you have available to spend this month.',
  aside:
    'Savings and anything you are not planning to touch. It stays out of what is available.',
};

interface AccountFormProps {
  account?: Account;
}

const kindOptions = (kinds: readonly string[]) =>
  kinds.map((id) => ({ id, label: ACCOUNT_KIND_LABELS[id as never] }));

export default function AccountForm({ account }: AccountFormProps) {
  const router = useRouter();
  const { accounts, addAccount, updateAccount } = useAccountStore();
  const { transactions, addTransaction } = useTransactionStore();

  const balance = account ? getAccountBalance(account, transactions) : 0;
  const isEditingLiability = account?.root === ACCOUNT_ROOTS.LIABILITIES;

  const { control, handleSubmit } = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: account
      ? {
          name: account.name,
          kind: account.kind ?? ACCOUNT_KINDS.CASH,
          onBudget: account.onBudget,
        }
      : { name: '', kind: ACCOUNT_KINDS.CASH, onBudget: true },
  });

  const kind = useWatch({ control, name: 'kind' });
  const onBudget = useWatch({ control, name: 'onBudget' });
  const isLiability = getRootForKind(kind) === ACCOUNT_ROOTS.LIABILITIES;

  const availableKinds = account
    ? kindOptions(isEditingLiability ? LIABILITY_KINDS : ASSET_KINDS)
    : [...kindOptions(ASSET_KINDS), ...kindOptions(LIABILITY_KINDS)];

  const onSubmit: SubmitHandler<AccountValues> = (data) => {
    const name = data.name.trim();
    const shared = { name, kind: data.kind, onBudget: data.onBudget };

    if (account) {
      updateAccount(account.id, shared);
      router.push(`/accounts/${account.id}`);
      return;
    }

    const root = getRootForKind(data.kind);
    const id = addAccount({ ...shared, root });

    if (data.openingBalance) {
      addTransaction({
        date: today(getLocalTimeZone()).toString(),
        description: `${name} opening balance`,
        postings: buildOpeningPostings({
          accountId: id,
          amount: toMinorUnits(data.openingBalance),
          root,
        }),
      });
    }

    router.push('/accounts');
  };

  const isDuplicateName = (value: string) =>
    accounts.some(
      (item) =>
        item.id !== account?.id &&
        item.name.trim().toLowerCase() === value.trim().toLowerCase(),
    );

  return (
    <section className="form-container">
      <h1 className="form-container__title">
        {account ? 'Edit account' : 'New account'}
      </h1>

      <form className="account-form" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="name"
          control={control}
          rules={{
            validate: (value) =>
              !isDuplicateName(value) ||
              'You already have an account with that name',
          }}
          render={({ field, fieldState }) => (
            <TextField
              label="Name"
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              errorMessage={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="kind"
          control={control}
          render={({ field, fieldState }) => (
            <Select
              label="Type"
              placeholder="Select a type"
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              items={availableKinds}
              description={
                account
                  ? 'Only types from the same group — swapping sides would change what the balance means'
                  : undefined
              }
              errorMessage={fieldState.error?.message}
            >
              {(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}
            </Select>
          )}
        />

        {account ? (
          <div className="account-form__figure">
            <p className="account-form__figure-label">
              {isEditingLiability ? 'Amount owed' : 'Balance'}
            </p>
            <p className="account-form__figure-value">
              {formatCurrency(isEditingLiability ? -balance : balance)}
            </p>
            <p className="account-form__figure-hint">
              Comes from the ledger.{' '}
              <Link href={`/accounts/${account.id}`}>Register a movement</Link>{' '}
              to change it.
            </p>
          </div>
        ) : (
          <Controller
            name="openingBalance"
            control={control}
            render={({ field, fieldState }) => (
              <NumberField
                label={isLiability ? 'Amount owed' : 'Balance'}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                formatOptions={MONEY_FORMAT}
                description={
                  isLiability
                    ? 'What you still owe today. Leave it empty to start from zero.'
                    : 'What it holds today — use a negative amount if it is overdrawn.'
                }
                errorMessage={fieldState.error?.message}
              />
            )}
          />
        )}

        <Controller
          name="onBudget"
          control={control}
          render={({ field }) => (
            <div className="account-form__budget">
              <p className="account-form__budget-label">Budget</p>
              <ToggleButtonGroup
                className="account-form__budget-toggle"
                selectedKeys={new Set([field.value ? 'in' : 'aside'])}
                onSelectionChange={(keys) => {
                  const selected = [...keys][0];
                  if (selected) field.onChange(selected === 'in');
                }}
              >
                <Toggle id="in">In the budget</Toggle>
                <Toggle id="aside">Set aside</Toggle>
              </ToggleButtonGroup>
              <p className="account-form__budget-hint">
                {onBudget ? BUDGET_HINTS.in : BUDGET_HINTS.aside}
              </p>
            </div>
          )}
        />

        <div className="account-form__full buttons-container">
          <Button
            variant="secondary"
            size="large"
            border
            className="buttons-container__btn-cancel"
            onPress={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="large"
            type="submit"
            className="buttons-container__btn-save"
          >
            {account ? 'Save account' : 'Add account'}
          </Button>
        </div>
      </form>
    </section>
  );
}
