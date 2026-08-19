'use client';

import {
  AccountValues,
  INTEREST_PERIOD_OPTIONS,
  INTEREST_TYPE_OPTIONS,
  PAYMENT_FREQUENCY_OPTIONS,
  PAYMENT_TERMS_OPTIONS,
} from '@/entities/account';
import { DatePicker } from '@/shared/components/ui/date-picker';
import { NumberField } from '@/shared/components/ui/number-field';
import { Select, SelectItem } from '@/shared/components/ui/select';
import { TextField } from '@/shared/components/ui/text-field';
import { Control, Controller, useWatch } from 'react-hook-form';

const MONEY_FORMAT = {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 2,
} as const;

interface DebtDetailsProps {
  control: Control<AccountValues>;
}

export function DebtDetails({ control }: DebtDetailsProps) {
  const interestType = useWatch({ control, name: 'interest.type' });
  const termsType = useWatch({ control, name: 'paymentTerms.type' });
  const isRevolving = termsType === 'revolving';

  return (
    <div className="account-form__details">
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
                description="Shows how much credit you have left"
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
                minValue={1}
                maxValue={31}
                description="Day of the month the statement closes"
                errorMessage={fieldState.error?.message}
              />
            )}
          />
        </>
      )}

      <Controller
        name="paymentDueDay"
        control={control}
        render={({ field, fieldState }) => (
          <NumberField
            label="Payment due day"
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            minValue={1}
            maxValue={31}
            errorMessage={fieldState.error?.message}
          />
        )}
      />

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

      {interestType && interestType !== 'none' && (
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
                minValue={0}
                description="Used to order debts by avalanche"
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
                {(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}
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

      {termsType === 'installments' && (
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
                {(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}
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
            value={field.value ?? null}
            onChange={field.onChange}
            errorMessage={fieldState.error?.message}
          />
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            label="Note"
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
    </div>
  );
}
