import { Money } from '@/shared/lib/money';

export type InterestRatePeriod = 'monthly' | 'yearly';

export type DebtInterest =
  | { type: 'none' }
  | { type: 'fixed'; rate: number; period: InterestRatePeriod }
  | {
      type: 'variable';
      rate: number;
      period: InterestRatePeriod;
      referenceRate?: string;
    };

export type PaymentFrequency = 'weekly' | 'monthly' | 'yearly' | 'custom';

export type DebtPaymentTerms =
  | {
      type: 'installments';
      installmentAmount: Money;
      totalInstallments?: number;
      frequency: PaymentFrequency;
      nextPaymentDueDate?: string;
    }
  | {
      type: 'revolving';
      minimumPayment?: Money;
      nextPaymentDueDate?: string;
    }
  | {
      type: 'flexible';
      suggestedPaymentAmount?: Money;
      nextPaymentDueDate?: string;
    };

/**
 * Descriptive only, like Firefly III's liability fields: nothing here is
 * recalculated, and none of it is a balance. What is owed comes from the
 * postings on the account.
 */
export interface DebtTerms {
  interest: DebtInterest;
  paymentTerms: DebtPaymentTerms;
}

export type DebtStatus = 'current' | 'late' | 'paid_off';

export const INTEREST_TYPE_OPTIONS = [
  { id: 'none', label: 'No interest' },
  { id: 'fixed', label: 'Fixed' },
  { id: 'variable', label: 'Variable' },
] as const;

export const INTEREST_PERIOD_OPTIONS = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
] as const;

export const PAYMENT_TERMS_OPTIONS = [
  { id: 'installments', label: 'Installments' },
  { id: 'revolving', label: 'Revolving' },
  { id: 'flexible', label: 'Flexible' },
] as const;

export const PAYMENT_FREQUENCY_OPTIONS = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
  { id: 'custom', label: 'Custom' },
] as const;
