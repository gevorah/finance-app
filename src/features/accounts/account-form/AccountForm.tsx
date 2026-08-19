'use client';

import { useMemo, useState } from 'react';
import {
  Account,
  ACCOUNT_KIND_LABELS,
  ACCOUNT_KINDS,
  ACCOUNT_ROOTS,
  AccountKind,
  accountSchema,
  AccountValues,
  ASSET_KINDS,
  budgetPlacementVaries,
  getAccountBalance,
  getRealAccounts,
  getRootForKind,
  isOnBudgetByDefault,
  LIABILITY_KIND_TO_PAYMENT_TYPE,
  LIABILITY_KINDS,
  useAccountStore,
} from '@/entities/account';
import {
  buildOpeningPostings,
  useTransactionStore,
} from '@/entities/transaction';
import { Button } from '@/shared/components/ui/button';
import { Disclosure } from '@/shared/components/ui/disclosure';
import { NumberField } from '@/shared/components/ui/number-field';
import { Select, SelectItem } from '@/shared/components/ui/select';
import { TextField } from '@/shared/components/ui/text-field';
import { Toggle, ToggleButtonGroup } from '@/shared/components/ui/toggle';
import { formatCurrency } from '@/shared/lib/currency';
import { collectErrorMessages } from '@/shared/lib/form';
import { toMajorUnits, toMinorUnits } from '@/shared/lib/money';
import { zodResolver } from '@hookform/resolvers/zod';
import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';

import { CloseAccount } from '../close-account/CloseAccount';
import { DebtDetails } from './DebtDetails';

import './AccountForm.scss';

const MONEY_FORMAT = {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 2,
} as const;

const BUDGET_LABELS = {
  asset: { in: 'In the budget', aside: 'Set aside' },
  debt: { in: 'In the budget', aside: 'Long term' },
};

const BUDGET_HINTS = {
  asset: {
    in: 'Counts towards what you have available to spend this month.',
    aside:
      'Savings and anything you are not planning to touch. It stays out of what is available.',
  },
  debt: {
    in: 'You pay it off month to month, so it comes out of what is available.',
    aside:
      'Long-term debt you are not settling this month. It stays out of what is available.',
  },
};

function toDebtTerms(data: AccountValues): Account['debtTerms'] {
  const terms = data.paymentTerms ?? { type: 'revolving' as const };

  return {
    interest: data.interest ?? { type: 'none' },
    paymentTerms: {
      ...terms,
      ...('installmentAmount' in terms && terms.installmentAmount
        ? { installmentAmount: toMinorUnits(terms.installmentAmount) }
        : {}),
      ...('minimumPayment' in terms && terms.minimumPayment
        ? { minimumPayment: toMinorUnits(terms.minimumPayment) }
        : {}),
      nextPaymentDueDate: terms.nextPaymentDueDate?.toString(),
    },
  } as Account['debtTerms'];
}

interface AccountFormProps {
  account?: Account;
}

const kindOptions = (kinds: readonly AccountKind[]) =>
  kinds.map((id) => ({ id, label: ACCOUNT_KIND_LABELS[id] }));

const isKind = (value: string | null): value is AccountKind =>
  value !== null && Object.values(ACCOUNT_KINDS).includes(value as AccountKind);

export default function AccountForm({ account }: AccountFormProps) {
  const router = useRouter();
  const requestedKind = useSearchParams().get('kind');
  const initialKind = isKind(requestedKind)
    ? requestedKind
    : ACCOUNT_KINDS.CASH;
  const { accounts, addAccount, updateAccount } = useAccountStore();
  const { transactions, addTransaction } = useTransactionStore();

  const balance = account ? getAccountBalance(account, transactions) : 0;
  const isEditingLiability = account?.root === ACCOUNT_ROOTS.LIABILITIES;

  const terms = account?.debtTerms?.paymentTerms;

  const schema = useMemo(
    () =>
      accountSchema.refine(
        (data) =>
          !getRealAccounts(accounts).some(
            (item) =>
              item.id !== account?.id &&
              item.name.trim().toLowerCase() === data.name.trim().toLowerCase(),
          ),
        {
          error: 'You already have an account with that name',
          path: ['name'],
        },
      ),
    [accounts, account?.id],
  );

  const { control, handleSubmit, setValue, formState } = useForm<AccountValues>(
    {
      resolver: zodResolver(schema),
      defaultValues: account
        ? ({
            name: account.name,
            kind: account.kind ?? ACCOUNT_KINDS.CASH,
            onBudget: account.onBudget,
            description: account.description ?? '',
            creditLimit: account.creditLimit
              ? toMajorUnits(account.creditLimit)
              : undefined,
            cutOffDay: account.cutOffDay,
            paymentDueDay: account.paymentDueDay,
            interest: account.debtTerms?.interest ?? { type: 'none' },
            paymentTerms: terms
              ? {
                  ...terms,
                  installmentAmount:
                    'installmentAmount' in terms && terms.installmentAmount
                      ? toMajorUnits(terms.installmentAmount)
                      : undefined,
                  minimumPayment:
                    'minimumPayment' in terms && terms.minimumPayment
                      ? toMajorUnits(terms.minimumPayment)
                      : undefined,
                  nextPaymentDueDate: terms.nextPaymentDueDate
                    ? parseDate(terms.nextPaymentDueDate)
                    : undefined,
                }
              : { type: 'revolving' },
          } as AccountValues)
        : ({
            name: '',
            kind: initialKind,
            onBudget: isOnBudgetByDefault(initialKind),
            description: '',
            interest: { type: 'none' },
            paymentTerms: {
              type: LIABILITY_KIND_TO_PAYMENT_TYPE[initialKind] ?? 'revolving',
            },
          } as AccountValues),
    },
  );

  const [detailsOpen, setDetailsOpen] = useState(Boolean(account?.debtTerms));
  const [handledSubmit, setHandledSubmit] = useState(formState.submitCount);

  const detailsHaveErrors =
    collectErrorMessages({
      creditLimit: formState.errors.creditLimit,
      cutOffDay: formState.errors.cutOffDay,
      paymentDueDay: formState.errors.paymentDueDay,
      interest: formState.errors.interest,
      paymentTerms: formState.errors.paymentTerms,
    }).length > 0;

  if (formState.submitCount !== handledSubmit) {
    setHandledSubmit(formState.submitCount);
    if (detailsHaveErrors) setDetailsOpen(true);
  }

  const kind = useWatch({ control, name: 'kind' });
  const onBudget = useWatch({ control, name: 'onBudget' });
  const isLiability = getRootForKind(kind) === ACCOUNT_ROOTS.LIABILITIES;
  const side = isLiability ? 'debt' : 'asset';
  const labels = BUDGET_LABELS[side];

  const availableKinds = account
    ? kindOptions(isEditingLiability ? LIABILITY_KINDS : ASSET_KINDS)
    : [...kindOptions(ASSET_KINDS), ...kindOptions(LIABILITY_KINDS)];

  const onSubmit: SubmitHandler<AccountValues> = (data) => {
    const name = data.name.trim();
    const root = getRootForKind(data.kind);
    const isDebt = root === ACCOUNT_ROOTS.LIABILITIES;

    const shared = {
      name,
      kind: data.kind,
      onBudget: data.onBudget,
      description: data.description?.trim() || undefined,
      ...(isDebt
        ? {
            creditLimit: data.creditLimit
              ? toMinorUnits(data.creditLimit)
              : undefined,
            cutOffDay: data.cutOffDay,
            paymentDueDay: data.paymentDueDay,
            debtTerms: toDebtTerms(data),
          }
        : {}),
    };

    if (account) {
      updateAccount(account.id, shared);
      router.push(`/accounts/${account.id}`);
      return;
    }

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

  return (
    <section className="form-container">
      <h1 className="form-container__title">
        {account ? 'Edit account' : 'New account'}
      </h1>

      <form className="account-form" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="name"
          control={control}
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
              onChange={(value) => {
                field.onChange(value);
                const nextKind = value as AccountKind;
                const next = LIABILITY_KIND_TO_PAYMENT_TYPE[nextKind];
                if (next) setValue('paymentTerms.type', next);
                if (!account && !formState.dirtyFields.onBudget) {
                  setValue('onBudget', isOnBudgetByDefault(nextKind));
                }
              }}
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

        {(account || budgetPlacementVaries(kind)) && (
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
                  <Toggle id="in">{labels.in}</Toggle>
                  <Toggle id="aside">{labels.aside}</Toggle>
                </ToggleButtonGroup>
                <p className="account-form__budget-hint">
                  {BUDGET_HINTS[side][onBudget ? 'in' : 'aside']}
                </p>
              </div>
            )}
          />
        )}

        {isLiability && (
          <Disclosure
            className="account-form__full"
            headingLevel={2}
            title="Card and loan details"
            description="Optional. Needed for available credit, due dates and the avalanche order."
            isExpanded={detailsOpen}
            onExpandedChange={setDetailsOpen}
          >
            <DebtDetails control={control} />
          </Disclosure>
        )}

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

      {account && (
        <section className="account-form__danger">
          <CloseAccount account={account} />
        </section>
      )}
    </section>
  );
}
