import { describe, expect, it } from 'vitest';

import {
  legacyDebtAccountId,
  legacyDebtsToAccounts,
  legacyDebtsToOpeningBalances,
} from './debt-migration';
import { ACCOUNT_KINDS, ACCOUNT_ROOTS } from './types';

const legacyState = {
  state: {
    debts: [
      {
        id: '1',
        creditorName: 'Bancolombia',
        type: 'loan',
        originalAmount: 3000000000,
        currentBalance: 2200000000,
        interest: { type: 'fixed', rate: 1.8, period: 'monthly' },
        paymentTerms: {
          type: 'installments',
          installmentAmount: 121970600,
          totalInstallments: 36,
          paidInstallments: 10,
          frequency: 'monthly',
          nextPaymentDueDate: '2026-09-15',
        },
        startDate: '2025-09-01',
        description: 'Crédito libre inversión',
        status: 'current',
        createdAt: '2026-06-20T10:00:00.000Z',
        updatedAt: '2026-06-20T10:00:00.000Z',
      },
      {
        id: '2',
        creditorName: 'RappiCard',
        type: 'credit_card',
        originalAmount: 100000000,
        currentBalance: 0,
        interest: { type: 'none' },
        paymentTerms: { type: 'revolving', cutOffDay: 5 },
        startDate: '2026-06-01',
        status: 'paid_off',
      },
    ],
  },
};

describe('legacyDebtsToAccounts', () => {
  const accounts = legacyDebtsToAccounts(legacyState);

  it('turns every debt into a liability account', () => {
    expect(accounts).toHaveLength(2);
    expect(accounts.every((a) => a.root === ACCOUNT_ROOTS.LIABILITIES)).toBe(
      true,
    );
  });

  it('keeps the creditor as the account name', () => {
    expect(accounts[0].name).toBe('Bancolombia');
  });

  it('maps the debt type onto an account kind', () => {
    expect(accounts[0].kind).toBe(ACCOUNT_KINDS.LOAN);
    expect(accounts[1].kind).toBe(ACCOUNT_KINDS.CREDIT_CARD);
  });

  it('carries interest and payment terms over untouched', () => {
    expect(accounts[0].debtTerms?.interest).toEqual({
      type: 'fixed',
      rate: 1.8,
      period: 'monthly',
    });
    expect(accounts[0].debtTerms?.paymentTerms).toMatchObject({
      type: 'installments',
      totalInstallments: 36,
      paidInstallments: 10,
    });
  });

  it('lifts the card cut-off day onto the account', () => {
    expect(accounts[1].cutOffDay).toBe(5);
  });

  it('stores no balance on the account', () => {
    expect(accounts[0]).not.toHaveProperty('currentBalance');
  });

  it('survives an empty or malformed payload', () => {
    expect(legacyDebtsToAccounts(undefined)).toEqual([]);
    expect(legacyDebtsToAccounts({ state: { debts: null } })).toEqual([]);
  });
});

describe('legacyDebtsToOpeningBalances', () => {
  const openings = legacyDebtsToOpeningBalances(legacyState);

  it('only opens a balance for debts that are still owed', () => {
    expect(openings).toHaveLength(1);
    expect(openings[0].accountId).toBe(legacyDebtAccountId('1'));
  });

  it('carries the outstanding amount, not the original one', () => {
    expect(openings[0].amountOwed).toBe(2200000000);
  });

  it('keeps the date the debt started', () => {
    expect(openings[0].startDate).toBe('2025-09-01');
  });
});
