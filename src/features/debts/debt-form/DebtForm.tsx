'use client';

import {
  Account,
  ACCOUNT_KINDS,
  ACCOUNT_ROOTS,
  debtSchema,
  DebtValues,
  getAmountOwed,
  INTEREST_PERIOD_OPTIONS,
  INTEREST_TYPE_OPTIONS,
  LIABILITY_KIND_OPTIONS,
  LIABILITY_KIND_TO_PAYMENT_TYPE,
  OPENING_BALANCE_ACCOUNT_ID,
  PAYMENT_FREQUENCY_OPTIONS,
  PAYMENT_TERMS_OPTIONS,
  useAccountsById,
  useAccountStore,
} from '@/entities/account';
import { buildPostings, useTransactionStore } from '@/entities/transaction';
import { Button } from '@/shared/components/ui/button';
import { DatePicker } from '@/shared/components/ui/date-picker';
import { NumberField } from '@/shared/components/ui/number-field';
import { Select, SelectItem } from '@/shared/components/ui/select';
import { TextField } from '@/shared/components/ui/text-field';
import { toMajorUnits, toMinorUnits } from '@/shared/lib/money';
import { zodResolver } from '@hookform/resolvers/zod';
import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
import { useRouter } from 'next/navigation';
import {
  Controller,
  DefaultValues,
  SubmitHandler,
  useForm,
  useWatch,
} from 'react-hook-form';

import './DebtForm.scss';

const MONEY_FORMAT = {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 2,
} as const;

interface DebtFormProps {
  debtInfo?: Account;
}

const getDefaultValues = (
  debt: Account | undefined,
  amountOwed: number,
): DefaultValues<DebtValues> => {
  if (!debt) {
    return {
      name: '',
      kind: ACCOUNT_KINDS.CREDIT_CARD,
      startDate: today(getLocalTimeZone()),
      description: '',
      interest: { type: 'none' },
      paymentTerms: { type: 'revolving' },
    };
  }

  const terms = debt.debtTerms?.paymentTerms;

  return {
    name: debt.name,
    kind: debt.kind,
    amountOwed: toMajorUnits(amountOwed),
    creditLimit: debt.creditLimit ? toMajorUnits(debt.creditLimit) : undefined,
    cutOffDay: debt.cutOffDay,
    startDate: today(getLocalTimeZone()),
    description: debt.description ?? '',
    interest: debt.debtTerms?.interest ?? { type: 'none' },
    paymentTerms: terms
      ? {
          ...terms,
          nextPaymentDueDate: terms.nextPaymentDueDate
            ? parseDate(terms.nextPaymentDueDate)
            : undefined,
        }
      : { type: 'revolving' },
  } as DefaultValues<DebtValues>;
};

export default function DebtForm({ debtInfo }: DebtFormProps) {
  const router = useRouter();
  const { addAccount, updateAccount } = useAccountStore();
  const { transactions, addTransaction } = useTransactionStore();
  const accountsById = useAccountsById();

  const amountOwed = debtInfo ? getAmountOwed(debtInfo, transactions) : 0;

  const { control, handleSubmit, setValue } = useForm<DebtValues>({
    resolver: zodResolver(debtSchema),
    defaultValues: getDefaultValues(debtInfo, amountOwed),
  });

  const interestType = useWatch({ control, name: 'interest.type' });
  const paymentTermsType = useWatch({ control, name: 'paymentTerms.type' });
  const isRevolving = paymentTermsType === 'revolving';

  const onSubmit: SubmitHandler<DebtValues> = (data) => {
    const debtTerms = {
      interest: data.interest,
      paymentTerms: {
        ...data.paymentTerms,
        nextPaymentDueDate: data.paymentTerms.nextPaymentDueDate?.toString(),
      },
    } as Account['debtTerms'];

    const shared = {
      name: data.name.trim(),
      kind: data.kind,
      creditLimit: data.creditLimit
        ? toMinorUnits(data.creditLimit)
        : undefined,
      cutOffDay: data.cutOffDay,
      description: data.description?.trim() || undefined,
      debtTerms,
    };

    if (debtInfo) {
      updateAccount(debtInfo.id, shared);
      router.push('/debts');
      return;
    }

    const id = addAccount({
      ...shared,
      root: ACCOUNT_ROOTS.LIABILITIES,
      onBudget: true,
    });

    addTransaction({
      date: data.startDate.toString(),
      description: `${data.name.trim()} opening balance`,
      postings: buildPostings(
        {
          amount: toMinorUnits(data.amountOwed),
          accountId: OPENING_BALANCE_ACCOUNT_ID,
          counterAccountId: id,
        },
        accountsById,
      ),
    });

    router.push('/debts');
  };

  return (
    <main className="debt-container">
      <section className="form-container">
        <h1 className="form-container__title">
          {debtInfo ? 'Edit Debt' : 'New Debt'}
        </h1>

        <form className="debt-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="debt-form__full">
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  label="Creditor"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          </div>

          <Controller
            name="kind"
            control={control}
            render={({ field, fieldState }) => (
              <Select
                label="Debt type"
                placeholder="Select debt type"
                name={field.name}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  setValue(
                    'paymentTerms.type',
                    LIABILITY_KIND_TO_PAYMENT_TYPE[
                      String(value)
                    ] as DebtValues['paymentTerms']['type'],
                  );
                }}
                items={LIABILITY_KIND_OPTIONS}
                errorMessage={fieldState.error?.message}
              >
                {(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}
              </Select>
            )}
          />

          <Controller
            name="amountOwed"
            control={control}
            render={({ field, fieldState }) => (
              <NumberField
                label="Amount owed"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                formatOptions={MONEY_FORMAT}
                isDisabled={Boolean(debtInfo)}
                description={
                  debtInfo
                    ? 'Comes from the ledger — register a payment to change it'
                    : undefined
                }
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          {!debtInfo && (
            <Controller
              name="startDate"
              control={control}
              render={({ field, fieldState }) => (
                <DatePicker
                  label="Owed since"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          )}

          {isRevolving && (
            <>
              <Controller
                name="creditLimit"
                control={control}
                render={({ field, fieldState }) => (
                  <NumberField
                    label="Credit limit"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    formatOptions={MONEY_FORMAT}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="cutOffDay"
                control={control}
                render={({ field, fieldState }) => (
                  <NumberField
                    label="Cut-off day"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
            </>
          )}

          <Controller
            name="interest.type"
            control={control}
            render={({ field, fieldState }) => (
              <Select
                label="Interest"
                placeholder="Select interest type"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                items={INTEREST_TYPE_OPTIONS}
                errorMessage={fieldState.error?.message}
              >
                {(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}
              </Select>
            )}
          />

          {interestType !== 'none' && (
            <>
              <Controller
                name="interest.rate"
                control={control}
                render={({ field, fieldState }) => (
                  <NumberField
                    label="Rate (%)"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="interest.period"
                control={control}
                render={({ field, fieldState }) => (
                  <Select
                    label="Rate period"
                    placeholder="Select period"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    items={INTEREST_PERIOD_OPTIONS}
                    errorMessage={fieldState.error?.message}
                  >
                    {(item) => (
                      <SelectItem id={item.id}>{item.label}</SelectItem>
                    )}
                  </Select>
                )}
              />
            </>
          )}

          <Controller
            name="paymentTerms.type"
            control={control}
            render={({ field, fieldState }) => (
              <Select
                label="Payment terms"
                placeholder="Select payment terms"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                items={PAYMENT_TERMS_OPTIONS}
                errorMessage={fieldState.error?.message}
              >
                {(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}
              </Select>
            )}
          />

          {paymentTermsType === 'installments' && (
            <>
              <Controller
                name="paymentTerms.installmentAmount"
                control={control}
                render={({ field, fieldState }) => (
                  <NumberField
                    label="Installment"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    formatOptions={MONEY_FORMAT}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="paymentTerms.frequency"
                control={control}
                render={({ field, fieldState }) => (
                  <Select
                    label="Frequency"
                    placeholder="Select frequency"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    items={PAYMENT_FREQUENCY_OPTIONS}
                    errorMessage={fieldState.error?.message}
                  >
                    {(item) => (
                      <SelectItem id={item.id}>{item.label}</SelectItem>
                    )}
                  </Select>
                )}
              />
            </>
          )}

          {isRevolving && (
            <Controller
              name="paymentTerms.minimumPayment"
              control={control}
              render={({ field, fieldState }) => (
                <NumberField
                  label="Minimum payment"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  formatOptions={MONEY_FORMAT}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          )}

          <Controller
            name="paymentTerms.nextPaymentDueDate"
            control={control}
            render={({ field, fieldState }) => (
              <DatePicker
                label="Next payment due"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          <div className="debt-form__full buttons-container">
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
              {debtInfo ? 'Update Debt' : 'Save Debt'}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
