'use client';

import {
  Account,
  debtPaymentSchema,
  DebtPaymentValues,
  getAmountOwed,
  getDebtAccounts,
  getRealAccounts,
  INTEREST_EXPENSE_ACCOUNT_ID,
  useAccountsById,
  useAccountStore,
} from '@/entities/account';
import {
  buildSplitPostings,
  SplitPart,
  useTransactionStore,
} from '@/entities/transaction';
import { Button } from '@/shared/components/ui/button';
import { DatePicker } from '@/shared/components/ui/date-picker';
import { NumberField } from '@/shared/components/ui/number-field';
import { Select, SelectItem } from '@/shared/components/ui/select';
import { formatCurrency } from '@/shared/lib/currency';
import { toMinorUnits } from '@/shared/lib/money';
import { zodResolver } from '@hookform/resolvers/zod';
import { getLocalTimeZone, today } from '@internationalized/date';
import { useRouter } from 'next/navigation';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';

import './DebtPaymentForm.scss';

const MONEY_FORMAT = {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 2,
} as const;

interface DebtPaymentFormProps {
  debt: Account;
}

export function DebtPaymentForm({ debt }: DebtPaymentFormProps) {
  const router = useRouter();
  const { accounts } = useAccountStore();
  const { transactions, addTransaction } = useTransactionStore();
  const accountsById = useAccountsById();

  const debtAccounts = getDebtAccounts(accounts);
  const realAccounts = getRealAccounts(accounts);

  const { control, handleSubmit } = useForm<DebtPaymentValues>({
    resolver: zodResolver(debtPaymentSchema),
    defaultValues: {
      debtAccountId: debt.id,
      paymentAccountId: realAccounts.find((account) => account.id !== debt.id)
        ?.id,
      interest: 0,
      date: today(getLocalTimeZone()),
    },
  });

  const debtAccountId = useWatch({ control, name: 'debtAccountId' });
  const amount = useWatch({ control, name: 'amount' });
  const interest = useWatch({ control, name: 'interest' });

  const selectedDebt = accountsById.get(debtAccountId) ?? debt;
  const paymentAccounts = realAccounts.filter(
    (account) => account.id !== selectedDebt.id,
  );

  const principal =
    Number.isFinite(amount) && Number.isFinite(interest)
      ? toMinorUnits(Number(amount)) - toMinorUnits(Number(interest))
      : undefined;

  const onSubmit: SubmitHandler<DebtPaymentValues> = (data) => {
    const total = toMinorUnits(Number(data.amount));
    const interestPaid = toMinorUnits(Number(data.interest));

    const splits: SplitPart[] = [
      { counterAccountId: data.debtAccountId, amount: total - interestPaid },
    ];

    if (interestPaid > 0) {
      splits.push({
        counterAccountId: INTEREST_EXPENSE_ACCOUNT_ID,
        amount: interestPaid,
      });
    }

    const paidDebt = accountsById.get(data.debtAccountId);

    addTransaction({
      description: `Payment · ${paidDebt?.name ?? 'Debt'}`,
      date: data.date.toString(),
      postings: buildSplitPostings(
        { accountId: data.paymentAccountId, splits },
        accountsById,
      ),
    });

    router.push('/debts');
  };

  return (
    <form className="debt-payment-form" onSubmit={handleSubmit(onSubmit)}>
      <p className="debt-payment-form__owed">
        {`You owe ${formatCurrency(Math.max(getAmountOwed(selectedDebt, transactions), 0))}`}
      </p>

      <Controller
        name="debtAccountId"
        control={control}
        render={({ field, fieldState }) => (
          <Select
            label="Debt"
            placeholder="Select debt"
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            items={debtAccounts}
            errorMessage={fieldState.error?.message}
          >
            {(item) => <SelectItem id={item.id}>{item.name}</SelectItem>}
          </Select>
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
            items={paymentAccounts}
            errorMessage={fieldState.error?.message}
          >
            {(item) => <SelectItem id={item.id}>{item.name}</SelectItem>}
          </Select>
        )}
      />

      <Controller
        name="amount"
        control={control}
        render={({ field, fieldState }) => (
          <NumberField
            label="Total paid"
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            formatOptions={MONEY_FORMAT}
            errorMessage={fieldState.error?.message}
          />
        )}
      />

      <Controller
        name="interest"
        control={control}
        render={({ field, fieldState }) => (
          <NumberField
            label="Of which interest"
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            formatOptions={MONEY_FORMAT}
            errorMessage={fieldState.error?.message}
          />
        )}
      />

      <p className="debt-payment-form__breakdown" role="status" aria-live="polite">
        {principal !== undefined &&
          principal > 0 &&
          `${formatCurrency(principal)} comes off the debt`}
      </p>

      <Controller
        name="date"
        control={control}
        render={({ field, fieldState }) => (
          <DatePicker
            label="Payment date"
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            errorMessage={fieldState.error?.message}
          />
        )}
      />

      <div className="buttons-container">
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
          Register payment
        </Button>
      </div>
    </form>
  );
}
