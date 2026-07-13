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
      installmentAmount: number;
      totalInstallments?: number;
      paidInstallments?: number;
      frequency: PaymentFrequency;
      nextPaymentDueDate?: string;
    }
  | {
      type: 'revolving';
      minimumPayment?: number;
      statementBalance?: number;
      cutOffDay?: number;
      nextPaymentDueDate?: string;
    }
  | {
      type: 'flexible';
      suggestedPaymentAmount?: number;
      nextPaymentDueDate?: string;
    };

export interface Debt {
  id: string;
  creditorName: string;
  type: DebtType;
  originalAmount: number;
  currentBalance: number;
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
