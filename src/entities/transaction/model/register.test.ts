import { ACCOUNT_ROOTS, DEFAULT_CASH_ACCOUNT_ID } from '@/entities/account';
import { toMinorUnits } from '@/shared/lib/money';
import { describe, expect, it } from 'vitest';

import { buildOpeningPostings } from './ledger';
import { getAccountRegister } from './selectors';
import { Posting, Transaction } from './types';

const CARD_ID = 'liabilities-card';
const FOOD_ID = 'expenses-food';
const TRANSPORT_ID = 'expenses-transport';

const transaction = (
  id: string,
  date: string,
  postings: Posting[],
  createdAt = `${date}T00:00:00.000Z`,
): Transaction => ({
  id,
  date,
  description: id,
  postings,
  createdAt,
  updatedAt: createdAt,
});

const spend = (id: string, date: string, major: number, createdAt?: string) =>
  transaction(
    id,
    date,
    [
      { accountId: CARD_ID, amount: -toMinorUnits(major) },
      { accountId: FOOD_ID, amount: toMinorUnits(major) },
    ],
    createdAt,
  );

const opening = transaction(
  'opening',
  '2026-08-01',
  buildOpeningPostings({
    accountId: CARD_ID,
    amount: toMinorUnits(500000),
    root: ACCOUNT_ROOTS.LIABILITIES,
  }),
);

const payment = transaction('payment', '2026-08-10', [
  { accountId: DEFAULT_CASH_ACCOUNT_ID, amount: -toMinorUnits(200000) },
  { accountId: CARD_ID, amount: toMinorUnits(200000) },
]);

describe('getAccountRegister', () => {
  const rows = getAccountRegister(
    [spend('lunch', '2026-08-15', 45000), payment, opening],
    CARD_ID,
  );

  it('shows the newest movement first and the opening balance last', () => {
    expect(rows.map((row) => row.transaction.id)).toEqual([
      'lunch',
      'payment',
      'opening',
    ]);
  });

  it('carries a running balance that ends on what the account owes today', () => {
    expect(rows.map((row) => row.runningBalance)).toEqual([
      -toMinorUnits(345000),
      -toMinorUnits(300000),
      -toMinorUnits(500000),
    ]);
  });

  it('leaves out transactions that never touch the account', () => {
    const elsewhere = transaction('bus', '2026-08-20', [
      { accountId: DEFAULT_CASH_ACCOUNT_ID, amount: -toMinorUnits(3000) },
      { accountId: TRANSPORT_ID, amount: toMinorUnits(3000) },
    ]);

    const ids = getAccountRegister(
      [...rows.map((r) => r.transaction), elsewhere],
      CARD_ID,
    ).map((row) => row.transaction.id);

    expect(ids).not.toContain('bus');
  });
});

describe('getAccountRegister ordering', () => {
  it('breaks a tie on the same date by when it was written down', () => {
    const second = spend(
      'second',
      '2026-08-15',
      10000,
      '2026-08-15T18:00:00.000Z',
    );
    const first = spend(
      'first',
      '2026-08-15',
      10000,
      '2026-08-15T09:00:00.000Z',
    );

    const order = (input: Transaction[]) =>
      getAccountRegister(input, CARD_ID).map((row) => row.transaction.id);

    expect(order([second, first])).toEqual(['second', 'first']);
    expect(order([first, second])).toEqual(['second', 'first']);
  });
});

describe('getAccountRegister counter side', () => {
  it('reads the counter from this account, not from the one that funded it', () => {
    const fromCard = getAccountRegister([payment], CARD_ID)[0];
    const fromCash = getAccountRegister([payment], DEFAULT_CASH_ACCOUNT_ID)[0];

    expect(fromCard.counterAccountIds).toEqual([DEFAULT_CASH_ACCOUNT_ID]);
    expect(fromCash.counterAccountIds).toEqual([CARD_ID]);
  });

  it('adds up every posting on the account when a split touches it twice', () => {
    const split = transaction('refunded', '2026-08-18', [
      { accountId: CARD_ID, amount: -toMinorUnits(80000) },
      { accountId: CARD_ID, amount: toMinorUnits(30000) },
      { accountId: FOOD_ID, amount: toMinorUnits(50000) },
    ]);

    const [row] = getAccountRegister([split], CARD_ID);

    expect(row.delta).toBe(-toMinorUnits(50000));
    expect(row.counterAccountIds).toEqual([FOOD_ID]);
    expect(row.isSplit).toBe(false);
  });

  it('marks a transaction as split when it lands in more than one counter account', () => {
    const groceries = transaction('groceries', '2026-08-19', [
      { accountId: CARD_ID, amount: -toMinorUnits(90000) },
      { accountId: FOOD_ID, amount: toMinorUnits(60000) },
      { accountId: TRANSPORT_ID, amount: toMinorUnits(30000) },
    ]);

    const [row] = getAccountRegister([groceries], CARD_ID);

    expect(row.isSplit).toBe(true);
    expect(row.counterAccountIds).toEqual([FOOD_ID, TRANSPORT_ID]);
  });
});
