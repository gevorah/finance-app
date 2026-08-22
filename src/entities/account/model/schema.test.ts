import { describe, expect, it } from 'vitest';

import { accountSchema } from './schema';
import { ACCOUNT_KINDS, isOnBudgetByDefault } from './types';

describe('opening an account without its optional terms', () => {
  const base = {
    name: 'Bancolombia',
    onBudget: true,
    openingBalance: 22000000,
  };

  it.each([
    ['loan', ACCOUNT_KINDS.LOAN, 'installments'],
    ['mortgage', ACCOUNT_KINDS.MORTGAGE, 'installments'],
    ['credit card', ACCOUNT_KINDS.CREDIT_CARD, 'revolving'],
    ['personal', ACCOUNT_KINDS.PERSONAL, 'flexible'],
  ])(
    'accepts a %s with nothing but the four required fields',
    (_, kind, terms) => {
      const result = accountSchema.safeParse({
        ...base,
        kind,
        interest: { type: 'none' },
        paymentTerms: { type: terms },
      });

      expect(result.success).toBe(true);
    },
  );
});

describe('where a new account lands by default', () => {
  it.each([
    [ACCOUNT_KINDS.CREDIT_CARD, true],
    [ACCOUNT_KINDS.CASH, true],
    [ACCOUNT_KINDS.CHECKING, true],
    [ACCOUNT_KINDS.SAVINGS, false],
    [ACCOUNT_KINDS.LOAN, true],
    [ACCOUNT_KINDS.MORTGAGE, false],
    [ACCOUNT_KINDS.VEHICLE, false],
    [ACCOUNT_KINDS.STUDENT, false],
  ])('puts %s in the budget: %s', (kind, expected) => {
    expect(isOnBudgetByDefault(kind)).toBe(expected);
  });
});
