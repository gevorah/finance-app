import type { Transaction } from '@/entities/transaction';
import { describe, expect, it } from 'vitest';

import { getTotalDebt } from './debt-selectors';
import {
  canDeleteAccount,
  getAccountPostingCount,
  getAvailableBalance,
  getSetAsideBalance,
  getTotalBalance,
} from './selectors';
import { Account, ACCOUNT_ROOTS } from './types';

const transfer: Transaction = {
  id: 't1',
  date: '2026-08-14',
  description: 'Retiro cajero',
  postings: [
    { accountId: 'assets-savings', amount: -30000000 },
    { accountId: 'assets-cash', amount: 30000000 },
  ],
  createdAt: '',
  updatedAt: '',
};

describe('canDeleteAccount', () => {
  it('allows deleting an account nothing has posted to', () => {
    expect(canDeleteAccount('assets-unused', [transfer])).toBe(true);
  });

  it('refuses an account that carries history', () => {
    expect(canDeleteAccount('assets-cash', [transfer])).toBe(false);
  });

  it('counts a posting on each side of the same transaction', () => {
    expect(getAccountPostingCount('assets-cash', [transfer])).toBe(1);
    expect(getAccountPostingCount('assets-savings', [transfer])).toBe(1);
  });
});

describe('what the accounts header reports', () => {
  const account = (
    id: string,
    root: Account['root'],
    onBudget: boolean,
  ): Account => ({
    id,
    name: id,
    root,
    onBudget,
    archived: false,
    createdAt: '',
    updatedAt: '',
  });

  const opening = (accountId: string, amount: number): Transaction => ({
    id: `open-${accountId}`,
    date: '2026-08-01',
    description: 'opening',
    postings: [
      { accountId, amount },
      { accountId: 'equity-opening-balances', amount: -amount },
    ],
    createdAt: '',
    updatedAt: '',
  });

  const accounts = [
    account('cash', ACCOUNT_ROOTS.ASSETS, true),
    account('savings', ACCOUNT_ROOTS.ASSETS, false),
    account('card', ACCOUNT_ROOTS.LIABILITIES, true),
  ];

  const transactions = [
    opening('cash', 100000),
    opening('savings', 5000000),
    opening('card', -290000000),
  ];

  it('reports what can be spent without subtracting the card', () => {
    expect(getAvailableBalance(accounts, transactions)).toBe(100000);
  });

  it('reports what is set aside on its own', () => {
    expect(getSetAsideBalance(accounts, transactions)).toBe(5000000);
  });

  it('never counts the same money in two of the three figures', () => {
    const available = getAvailableBalance(accounts, transactions);
    const setAside = getSetAsideBalance(accounts, transactions);
    const owed = getTotalDebt(accounts, transactions);

    expect(available + setAside - owed).toBe(
      getTotalBalance(accounts, transactions),
    );
  });

  it('leaves a credit on a card out of the three figures, not out of the app', () => {
    const overpaid = [...transactions, opening('card', 295000000)];

    // cash 100.000 + savings 5.000.000 + a 5.000.000 credit left on the card
    expect(getTotalBalance(accounts, overpaid)).toBe(10100000);
    expect(getTotalDebt(accounts, overpaid)).toBe(0);
    expect(getAvailableBalance(accounts, overpaid)).toBe(100000);
    expect(getSetAsideBalance(accounts, overpaid)).toBe(5000000);
  });
});
