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
      installmentAmount?: Money;
      totalInstallments?: number;
      frequency?: PaymentFrequency;
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
 * Descriptive only: a field belongs here when it changes because the agreement
 * changed, never because money moved. What is owed comes from the postings.
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

/**
 * A yearly rate is read as effective, which is the figure statements are
 * required to show. A rate quoted per month is already effective, so a nominal
 * yearly figure belongs in the monthly option divided by its periods.
 */
export const INTEREST_PERIOD_OPTIONS = [
  { id: 'monthly', label: 'Per month' },
  { id: 'yearly', label: 'Per year, effective' },
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
