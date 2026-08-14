'use client';

import {
  Debt,
  DebtPaymentTerms,
  debtSchema,
  DebtType,
  DebtValues,
} from '@/entities/debt';
import { Button } from '@/shared/components/ui/button';
import { DatePicker } from '@/shared/components/ui/date-picker';
import { NumberField } from '@/shared/components/ui/number-field';
import { Select, SelectItem } from '@/shared/components/ui/select';
import { TextField } from '@/shared/components/ui/text-field';
import { toMajorUnits, toMinorUnits } from '@/shared/lib/money';
import { useDebtStore } from '@/entities/debt';
import { zodResolver } from '@hookform/resolvers/zod';
import { parseDate } from '@internationalized/date';
import { useRouter } from 'next/navigation';
import {
  Controller,
  DefaultValues,
  SubmitHandler,
  useForm,
  useWatch,
} from 'react-hook-form';

import './DebtForm.scss';

interface DebtFormProps {
  debtInfo?: Debt;
}

const DEBT_TYPE_OPTIONS = [
  { id: 'credit_card', label: 'Credit card' },
  { id: 'loan', label: 'Loan' },
  { id: 'personal', label: 'Personal' },
  { id: 'mortgage', label: 'Mortgage' },
  { id: 'vehicle', label: 'Vehicle' },
  { id: 'student', label: 'Student' },
  { id: 'other', label: 'Other' },
];

const INTEREST_TYPE_OPTIONS = [
  { id: 'none', label: 'No interest' },
  { id: 'fixed', label: 'Fixed' },
  { id: 'variable', label: 'Variable' },
];

const INTEREST_PERIOD_OPTIONS = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];

const PAYMENT_TERMS_OPTIONS = [
  { id: 'installments', label: 'Installments' },
  { id: 'revolving', label: 'Revolving' },
  { id: 'flexible', label: 'Flexible' },
];

const PAYMENT_FREQUENCY_OPTIONS = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
  { id: 'custom', label: 'Custom' },
];

const DEBT_TYPE_TO_PAYMENT_TYPE: Record<DebtType, DebtPaymentTerms['type']> = {
  credit_card: 'revolving',
  loan: 'installments',
  mortgage: 'installments',
  vehicle: 'installments',
  student: 'installments',
  personal: 'flexible',
  other: 'flexible',
};


const MONEY_TERM_KEYS = [
  'installmentAmount',
  'minimumPayment',
  'statementBalance',
  'suggestedPaymentAmount',
] as const;

function convertTerms(
  terms: Record<string, unknown>,
  convert: (value: number) => number,
): Record<string, number> {
  return MONEY_TERM_KEYS.reduce<Record<string, number>>((acc, key) => {
    const value = terms[key];
    if (typeof value === 'number') acc[key] = convert(value);
    return acc;
  }, {});
}

const toMajorPaymentTerms = (terms: DebtPaymentTerms) =>
  convertTerms(terms as unknown as Record<string, unknown>, toMajorUnits);

const toMinorPaymentTerms = (terms: DebtValues['paymentTerms']) =>
  convertTerms(terms as unknown as Record<string, unknown>, toMinorUnits);

const getDefaultValues = (
  debt?: Debt,
): DefaultValues<DebtValues> | undefined => {
  if (!debt) {
    return {
      creditorName: '',
      type: 'credit_card',
      originalAmount: undefined,
      currentBalance: undefined,
      interest: { type: 'none' },
      paymentTerms: { type: DEBT_TYPE_TO_PAYMENT_TYPE.credit_card },
      startDate: undefined,
      description: '',
    };
  }

  return {
    ...debt,
    originalAmount: toMajorUnits(debt.originalAmount),
    currentBalance: toMajorUnits(debt.currentBalance),
    startDate: parseDate(debt.startDate),
    paymentTerms: {
      ...debt.paymentTerms,
      ...toMajorPaymentTerms(debt.paymentTerms),
      nextPaymentDueDate: debt.paymentTerms.nextPaymentDueDate
        ? parseDate(debt.paymentTerms.nextPaymentDueDate)
        : undefined,
    },
  };
};

export default function DebtForm({ debtInfo }: DebtFormProps) {
  const router = useRouter();
  const { addDebt, updateDebt } = useDebtStore();

  const { control, handleSubmit, setValue } = useForm<DebtValues>({
    resolver: zodResolver(debtSchema),
    defaultValues: getDefaultValues(debtInfo),
  });

  const interestType = useWatch({
    control,
    name: 'interest.type',
  });

  const paymentTermsType = useWatch({
    control,
    name: 'paymentTerms.type',
  });

  const onSubmit: SubmitHandler<DebtValues> = (data) => {
    const debtData = {
      creditorName: data.creditorName.trim(),
      type: data.type,

      originalAmount: toMinorUnits(data.originalAmount),
      currentBalance: toMinorUnits(data.currentBalance ?? data.originalAmount),

      interest: data.interest,

      paymentTerms: {
        ...data.paymentTerms,
        ...toMinorPaymentTerms(data.paymentTerms),
        nextPaymentDueDate: data.paymentTerms.nextPaymentDueDate?.toString(),
      },

      startDate: data.startDate.toString(),
      description: data.description?.trim() || undefined,
    };

    if (debtInfo) {
      updateDebt(debtInfo.id, debtData);
    } else {
      addDebt(debtData);
    }

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
              name="creditorName"
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
            name="type"
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
                    DEBT_TYPE_TO_PAYMENT_TYPE[value as DebtType],
                  );
                }}
                items={DEBT_TYPE_OPTIONS}
                errorMessage={fieldState.error?.message}
              >
                {(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}
              </Select>
            )}
          />

          <Controller
            name="originalAmount"
            control={control}
            render={({ field, fieldState }) => (
              <NumberField
                label="Original amount"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="currentBalance"
            control={control}
            render={({ field, fieldState }) => (
              <NumberField
                label="Current balance"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="startDate"
            control={control}
            render={({ field, fieldState }) => (
              <DatePicker
                label="Start date"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="interest.type"
            control={control}
            render={({ field, fieldState }) => (
              <Select
                label="Interest type"
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
                    label="Interest rate"
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
                    label="Interest period"
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

          {interestType === 'variable' && (
            <Controller
              name="interest.referenceRate"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  label="Reference rate"
                  name={field.name}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          )}

          <Controller
            name="paymentTerms.type"
            control={control}
            render={({ field, fieldState }) => (
              <Select
                label="Payment type"
                placeholder="Select payment type"
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
                    label="Installment amount"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="paymentTerms.totalInstallments"
                control={control}
                render={({ field, fieldState }) => (
                  <NumberField
                    label="Total installments"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="paymentTerms.paidInstallments"
                control={control}
                render={({ field, fieldState }) => (
                  <NumberField
                    label="Paid installments"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
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

          {paymentTermsType === 'revolving' && (
            <>
              <Controller
                name="paymentTerms.minimumPayment"
                control={control}
                render={({ field, fieldState }) => (
                  <NumberField
                    label="Minimum payment"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="paymentTerms.statementBalance"
                control={control}
                render={({ field, fieldState }) => (
                  <NumberField
                    label="Statement balance"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="paymentTerms.cutOffDay"
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

          {paymentTermsType === 'flexible' && (
            <Controller
              name="paymentTerms.suggestedPaymentAmount"
              control={control}
              render={({ field, fieldState }) => (
                <NumberField
                  label="Suggested payment"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
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
                label="Next payment due date"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          <div className="debt-form__full">
            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  label="Description"
                  name={field.name}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          </div>

          <div className="buttons-container debt-form__full">
            <Button
              variant="secondary"
              size="large"
              border={true}
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
              {debtInfo ? 'Update Debt' : 'Save Debt'}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
