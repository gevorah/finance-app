import {
  PersistedRecord,
  readPersistedList,
  readPersistedMoney,
} from '@/shared/lib/persist';

import { Debt } from './types';

const MONEY_PAYMENT_TERMS = [
  'installmentAmount',
  'minimumPayment',
  'statementBalance',
  'suggestedPaymentAmount',
];

export function migrateDebtsToV1(persisted: unknown): { debts: Debt[] } {
  const debts = readPersistedList(persisted, 'debts').map((entry) => {
    const terms = { ...((entry.paymentTerms ?? {}) as PersistedRecord) };

    for (const key of MONEY_PAYMENT_TERMS) {
      if (typeof terms[key] === 'number') {
        terms[key] = readPersistedMoney(terms[key]);
      }
    }

    return {
      ...entry,
      originalAmount: readPersistedMoney(entry.originalAmount),
      currentBalance: readPersistedMoney(entry.currentBalance),
      paymentTerms: terms,
    } as unknown as Debt;
  });

  return { debts };
}
