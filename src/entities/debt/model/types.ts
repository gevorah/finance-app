import { Money } from '@/shared/lib/money';

export type DebtType =
  | 'credit_card'
  | 'loan'
  | 'personal'
  | 'mortgage'
  | 'vehicle'
  | 'student'
  | 'other';

export type DebtStatus = 'current' | 'late' | 'paid_off';

export type InterestRatePeriod = 'monthly' | 'yearly';

export type DebtInterest =
  | {
      type: 'none';
    }
  | {
      type: 'fixed';
      rate: number;
      period: InterestRatePeriod;
    }
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
      paidInstallments?: number;
      frequency: PaymentFrequency;
      nextPaymentDueDate?: string;
    }
  | {
      type: 'revolving';
      minimumPayment?: Money;
      statementBalance?: Money;
      cutOffDay?: number;
      nextPaymentDueDate?: string;
    }
  | {
      type: 'flexible';
      suggestedPaymentAmount?: Money;
      nextPaymentDueDate?: string;
    };

export interface Debt {
  id: string;
  creditorName: string;
  type: DebtType;
  originalAmount: Money;
  currentBalance: Money;
  interest: DebtInterest;
  paymentTerms: DebtPaymentTerms;
  startDate: string;
  paidOffDate?: string;
  description?: string;
  priority?: number;
  status: DebtStatus;
  createdAt: string;
  updatedAt: string;
}

export type DebtInput = Omit<Debt, 'id' | 'status' | 'createdAt' | 'updatedAt'>;
