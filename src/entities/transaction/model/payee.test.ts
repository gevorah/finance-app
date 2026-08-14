import {
  Account,
  ACCOUNT_ROOTS,
  DEFAULT_CASH_ACCOUNT_ID,
  indexAccounts,
} from '@/entities/account';
import { describe, expect, it } from 'vitest';

import { buildPostings } from './ledger';
import { getPayees, getPayeeSuggestion } from './selectors';
import { Transaction } from './types';

const CARD_ID = 'liabilities-card';
const FOOD_ID = 'expenses-food';
const SHOPPING_ID = 'expenses-shopping';

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
  account(FOOD_ID, ACCOUNT_ROOTS.EXPENSES),
  account(SHOPPING_ID, ACCOUNT_ROOTS.EXPENSES),
]);

const expense = (
  id: string,
  payee: string | undefined,
  date: string,
  accountId: string,
  counterAccountId: string,
): Transaction => ({
  id,
  date,
  description: id,
  payee,
  postings: buildPostings({
    amount: 5000000,
    accountId,
    counterAccountId,
  }, accountsById),
  createdAt: '',
  updatedAt: '',
});

const transactions: Transaction[] = [
  expense('t1', 'Éxito', '2026-07-01', DEFAULT_CASH_ACCOUNT_ID, SHOPPING_ID),
  expense('t2', 'Éxito', '2026-08-01', CARD_ID, FOOD_ID),
  expense('t3', 'Rappi', '2026-08-02', DEFAULT_CASH_ACCOUNT_ID, FOOD_ID),
  expense('t4', undefined, '2026-08-03', DEFAULT_CASH_ACCOUNT_ID, FOOD_ID),
];

describe('getPayees', () => {
  it('lists each payee once, sorted by locale, ignoring those without one', () => {
       expect(getPayees(transactions)).toEqual(['Éxito', 'Rappi']);
  });
});

describe('getPayeeSuggestion', () => {
  it('suggests what was used the last time, not the first', () => {
    expect(getPayeeSuggestion('Éxito', transactions, accountsById)).toEqual({
      accountId: CARD_ID,
      counterAccountId: FOOD_ID,
    });
  });

  it('ignores case and surrounding spaces', () => {
    expect(
      getPayeeSuggestion('  éxito ', transactions, accountsById),
    ).toEqual({ accountId: CARD_ID, counterAccountId: FOOD_ID });
  });

  it('returns nothing for an unknown or empty payee', () => {
    expect(
      getPayeeSuggestion('Carulla', transactions, accountsById),
    ).toBeUndefined();
    expect(getPayeeSuggestion('   ', transactions, accountsById)).toBeUndefined();
  });
});
