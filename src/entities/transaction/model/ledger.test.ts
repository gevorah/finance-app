import {
  Account,
  ACCOUNT_ROOTS,
  DEFAULT_CASH_ACCOUNT_ID,
  DEFAULT_INCOME_ACCOUNT_ID,
  indexAccounts,
  OPENING_BALANCE_ACCOUNT_ID,
} from '@/entities/account';
import { toMinorUnits } from '@/shared/lib/money';
import { describe, expect, it } from 'vitest';

import {
  buildOpeningPostings,
  buildPostings,
  describeTransaction,
  getPostingsTotal,
  isBalanced,
} from './ledger';
import { Transaction, TRANSACTION_KINDS } from './types';

const CARD_ID = 'liabilities-card';
const LOAN_ID = 'liabilities-loan';
const FOOD_ID = 'expenses-food';
const INTEREST_ID = 'expenses-interest';

const account = (id: string, root: Account['root']): Account => ({
  id,
  name: id,
  root,
  onBudget: true,
  archived: false,
  createdAt: '',
  updatedAt: '',
});

const accountsById = indexAccounts([
  account(DEFAULT_CASH_ACCOUNT_ID, ACCOUNT_ROOTS.ASSETS),
  account(CARD_ID, ACCOUNT_ROOTS.LIABILITIES),
  account(OPENING_BALANCE_ACCOUNT_ID, ACCOUNT_ROOTS.EQUITY),
  account(DEFAULT_INCOME_ACCOUNT_ID, ACCOUNT_ROOTS.INCOME),
  account(LOAN_ID, ACCOUNT_ROOTS.LIABILITIES),
  account(FOOD_ID, ACCOUNT_ROOTS.EXPENSES),
  account(INTEREST_ID, ACCOUNT_ROOTS.EXPENSES),
]);

const transaction = (postings: Transaction['postings']): Transaction => ({
  id: 't',
  date: '2026-08-14',
  description: 'test',
  postings,
  createdAt: '',
  updatedAt: '',
});

describe('buildPostings', () => {
  const cases = [
    {
      kind: TRANSACTION_KINDS.EXPENSE,
      accountId: DEFAULT_CASH_ACCOUNT_ID,
      counterAccountId: FOOD_ID,
    },
    {
      kind: TRANSACTION_KINDS.INCOME,
      accountId: DEFAULT_CASH_ACCOUNT_ID,
      counterAccountId: DEFAULT_INCOME_ACCOUNT_ID,
    },
    {
      kind: TRANSACTION_KINDS.TRANSFER,
      accountId: DEFAULT_CASH_ACCOUNT_ID,
      counterAccountId: CARD_ID,
    },
  ] as const;

  it.each(cases)(
    'balances a $kind to zero',
    ({ accountId, counterAccountId }) => {
      const postings = buildPostings(
        { accountId, counterAccountId, amount: toMinorUnits(45000.5) },
        accountsById,
      );

      expect(getPostingsTotal(postings)).toBe(0);
      expect(isBalanced(postings)).toBe(true);
    },
  );

  it.each(cases)(
    'writes a $kind that reads back as the same kind',
    ({ kind, ...draft }) => {
      const postings = buildPostings(
        { ...draft, amount: toMinorUnits(45000.5) },
        accountsById,
      );

      expect(
        describeTransaction(transaction(postings), accountsById).kind,
      ).toBe(kind);
    },
  );

  it('takes money out of the paying account on an expense', () => {
    const postings = buildPostings(
      {
        amount: toMinorUnits(50000),
        accountId: DEFAULT_CASH_ACCOUNT_ID,
        counterAccountId: FOOD_ID,
      },
      accountsById,
    );

    expect(postings).toContainEqual({
      accountId: DEFAULT_CASH_ACCOUNT_ID,
      amount: -5000000,
    });
    expect(postings).toContainEqual({ accountId: FOOD_ID, amount: 5000000 });
  });

  it('puts money into the receiving account on an income', () => {
    const postings = buildPostings(
      {
        amount: toMinorUnits(4500000),
        accountId: DEFAULT_CASH_ACCOUNT_ID,
        counterAccountId: DEFAULT_INCOME_ACCOUNT_ID,
      },
      accountsById,
    );

    expect(postings).toContainEqual({
      accountId: DEFAULT_CASH_ACCOUNT_ID,
      amount: 450000000,
    });
    expect(postings).toContainEqual({
      accountId: DEFAULT_INCOME_ACCOUNT_ID,
      amount: -450000000,
    });
  });

  it('never drifts across many postings, unlike floats', () => {
    const postings = Array.from({ length: 30 }).flatMap(() =>
      buildPostings(
        {
          amount: toMinorUnits(0.1),
          accountId: DEFAULT_CASH_ACCOUNT_ID,
          counterAccountId: FOOD_ID,
        },
        accountsById,
      ),
    );

    expect(getPostingsTotal(postings)).toBe(0);
  });
});

describe('buildOpeningPostings', () => {
  it('leaves an asset holding what it already held', () => {
    const postings = buildOpeningPostings({
      accountId: DEFAULT_CASH_ACCOUNT_ID,
      amount: toMinorUnits(440000),
      root: ACCOUNT_ROOTS.ASSETS,
    });

    expect(postings).toContainEqual({
      accountId: DEFAULT_CASH_ACCOUNT_ID,
      amount: 44000000,
    });
    expect(getPostingsTotal(postings)).toBe(0);
  });

  it('leaves a liability owing what is owed, not holding it', () => {
    const postings = buildOpeningPostings({
      accountId: CARD_ID,
      amount: toMinorUnits(850000),
      root: ACCOUNT_ROOTS.LIABILITIES,
    });

    expect(postings).toContainEqual({
      accountId: CARD_ID,
      amount: -85000000,
    });
    expect(getPostingsTotal(postings)).toBe(0);
  });

  it('reads back as an opening balance whichever side it opens', () => {
    const roots = [ACCOUNT_ROOTS.ASSETS, ACCOUNT_ROOTS.LIABILITIES] as const;

    for (const root of roots) {
      const postings = buildOpeningPostings({
        accountId:
          root === ACCOUNT_ROOTS.ASSETS ? DEFAULT_CASH_ACCOUNT_ID : CARD_ID,
        amount: toMinorUnits(100000),
        root,
      });

      expect(
        describeTransaction(transaction(postings), accountsById).kind,
      ).toBe(TRANSACTION_KINDS.OPENING);
    }
  });
});

describe('isBalanced', () => {
  it('rejects postings that do not sum to zero', () => {
    expect(
      isBalanced([
        { accountId: DEFAULT_CASH_ACCOUNT_ID, amount: -100 },
        { accountId: FOOD_ID, amount: 99 },
      ]),
    ).toBe(false);
  });

  it('rejects a single posting', () => {
    expect(isBalanced([{ accountId: FOOD_ID, amount: 0 }])).toBe(false);
  });
});

describe('describeTransaction', () => {
  it('reads an expense from the roots it touches', () => {
    const view = describeTransaction(
      transaction([
        { accountId: DEFAULT_CASH_ACCOUNT_ID, amount: -5000000 },
        { accountId: FOOD_ID, amount: 5000000 },
      ]),
      accountsById,
    );

    expect(view).toMatchObject({
      amount: 5000000,
      accountId: DEFAULT_CASH_ACCOUNT_ID,
      counterAccountId: FOOD_ID,
      isSplit: false,
    });
  });

  it('reads an income and points at the receiving account', () => {
    const view = describeTransaction(
      transaction([
        { accountId: DEFAULT_INCOME_ACCOUNT_ID, amount: -450000000 },
        { accountId: DEFAULT_CASH_ACCOUNT_ID, amount: 450000000 },
      ]),
      accountsById,
    );

    expect(view.kind).toBe(TRANSACTION_KINDS.INCOME);
    expect(view.accountId).toBe(DEFAULT_CASH_ACCOUNT_ID);
    expect(view.counterAccountId).toBe(DEFAULT_INCOME_ACCOUNT_ID);
  });

  it('reads a move between two real accounts as a transfer', () => {
    const view = describeTransaction(
      transaction([
        { accountId: DEFAULT_CASH_ACCOUNT_ID, amount: -30000000 },
        { accountId: CARD_ID, amount: 30000000 },
      ]),
      accountsById,
    );

    expect(view.kind).toBe(TRANSACTION_KINDS.TRANSFER);
  });

  it('reports the funding side as the amount when the counter side is split', () => {
    const view = describeTransaction(
      transaction([
        { accountId: DEFAULT_CASH_ACCOUNT_ID, amount: -121970600 },
        { accountId: LOAN_ID, amount: 101970600 },
        { accountId: INTEREST_ID, amount: 20000000 },
      ]),
      accountsById,
    );

    expect(view.amount).toBe(121970600);
    expect(view.accountId).toBe(DEFAULT_CASH_ACCOUNT_ID);
    expect(view.isSplit).toBe(true);
    expect(view.counterPostings).toHaveLength(2);
  });

  it('points at the largest counter posting of a split', () => {
    const view = describeTransaction(
      transaction([
        { accountId: DEFAULT_CASH_ACCOUNT_ID, amount: -20000000 },
        { accountId: FOOD_ID, amount: 15000000 },
        { accountId: INTEREST_ID, amount: 5000000 },
      ]),
      accountsById,
    );

    expect(view.counterAccountId).toBe(FOOD_ID);
  });

  it('reads an equity posting as an opening balance', () => {
    const view = describeTransaction(
      transaction([
        { accountId: OPENING_BALANCE_ACCOUNT_ID, amount: -20000000 },
        { accountId: DEFAULT_CASH_ACCOUNT_ID, amount: 20000000 },
      ]),
      accountsById,
    );

    expect(view.kind).toBe(TRANSACTION_KINDS.OPENING);
  });

  it('survives a round trip through the form draft', () => {
    const draft = {
      amount: toMinorUnits(120000),
      accountId: CARD_ID,
      counterAccountId: FOOD_ID,
    } as const;

    const view = describeTransaction(
      transaction(buildPostings(draft, accountsById)),
      accountsById,
    );

    expect(view).toMatchObject(draft);
  });
});
