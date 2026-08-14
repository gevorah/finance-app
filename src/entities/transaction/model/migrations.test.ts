import {
  DEFAULT_CASH_ACCOUNT_ID,
  DEFAULT_INCOME_ACCOUNT_ID,
  OPENING_BALANCE_ACCOUNT_ID,
} from '@/entities/account';
import { describe, expect, it } from 'vitest';

import { getPostingsTotal, isBalanced } from './ledger';
import {
  buildOpeningBalanceTransactions,
  migrateTransactionsToV2,
} from './migrations';

const v1State = {
  transactions: [
    {
      id: '1',
      type: 'expense',
      accountId: DEFAULT_CASH_ACCOUNT_ID,
      category: 'food',
      amount: 4500000,
      date: '2026-08-01',
      description: 'Rappi Order',
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
    },
    {
      id: '2',
      type: 'income',
      accountId: DEFAULT_CASH_ACCOUNT_ID,
      category: 'salary',
      amount: 450000000,
      date: '2026-08-01',
      description: 'Monthly Salary',
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
    },
    {
      id: '3',
      type: 'transfer',
      accountId: DEFAULT_CASH_ACCOUNT_ID,
      transferAccountId: 'assets-savings',
      amount: 30000000,
      date: '2026-08-02',
      description: 'Retiro cajero',
      createdAt: '2026-08-02T00:00:00.000Z',
      updatedAt: '2026-08-02T00:00:00.000Z',
    },
  ],
};

describe('migrateTransactionsToV2', () => {
  const { transactions } = migrateTransactionsToV2(v1State);

  it('keeps every transaction', () => {
    expect(transactions).toHaveLength(3);
  });

  it('produces balanced postings for all of them', () => {
    for (const transaction of transactions) {
      expect(isBalanced(transaction.postings)).toBe(true);
      expect(getPostingsTotal(transaction.postings)).toBe(0);
    }
  });

  it('preserves the amount without changing units', () => {
    const expense = transactions.find((t) => t.id === '1');
    expect(
      expense?.postings.find((p) => p.accountId === DEFAULT_CASH_ACCOUNT_ID)
        ?.amount,
    ).toBe(-4500000);
  });

  it('maps the legacy income category onto the salary account', () => {
    const income = transactions.find((t) => t.id === '2');
    expect(
      income?.postings.find((p) => p.accountId === DEFAULT_INCOME_ACCOUNT_ID)
        ?.amount,
    ).toBe(-450000000);
  });

  it('keeps both sides of a transfer', () => {
    const transfer = transactions.find((t) => t.id === '3');
    expect(transfer?.postings.map((p) => p.accountId).sort()).toEqual([
      DEFAULT_CASH_ACCOUNT_ID,
      'assets-savings',
    ]);
  });

  it('does not crash on an empty or malformed payload', () => {
    expect(migrateTransactionsToV2(undefined).transactions).toEqual([]);
    expect(migrateTransactionsToV2({ transactions: null }).transactions).toEqual(
      [],
    );
  });
});

describe('buildOpeningBalanceTransactions', () => {
  const persistedAccounts = {
    accounts: [
      { id: DEFAULT_CASH_ACCOUNT_ID, initialBalance: 200000 },
      { id: 'liabilities-card', initialBalance: -850000 },
      { id: 'assets-empty', initialBalance: 0 },
    ],
  };

  const opening = buildOpeningBalanceTransactions(
    persistedAccounts,
    '2026-08-01',
  );

  it('skips accounts that started at zero', () => {
    expect(opening).toHaveLength(2);
  });

  it('balances each opening against equity', () => {
    for (const transaction of opening) {
      expect(isBalanced(transaction.postings)).toBe(true);
      expect(
        transaction.postings.some(
          (p) => p.accountId === OPENING_BALANCE_ACCOUNT_ID,
        ),
      ).toBe(true);
    }
  });

  it('converts the balance to minor units', () => {
    const cash = opening.find((t) => t.id.includes(DEFAULT_CASH_ACCOUNT_ID));
    expect(
      cash?.postings.find((p) => p.accountId === DEFAULT_CASH_ACCOUNT_ID)
        ?.amount,
    ).toBe(20000000);
  });
});
