import type { Transaction } from '@/entities/transaction';
import { describe, expect, it } from 'vitest';

import {
  canDeleteAccount,
  getAccountPostingCount,
  getAvailableBalance,
  getDueNowBalance,
  getLongTermBalance,
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
    account('mortgage', ACCOUNT_ROOTS.LIABILITIES, false),
  ];

  const transactions = [
    opening('cash', 100000),
    opening('savings', 5000000),
    opening('card', -290000000),
    opening('mortgage', -18000000000),
  ];

  const figures = (txs: Transaction[]) => ({
    available: getAvailableBalance(accounts, txs),
    setAside: getSetAsideBalance(accounts, txs),
    dueNow: getDueNowBalance(accounts, txs),
    longTerm: getLongTermBalance(accounts, txs),
  });

  it('reports what can be spent without subtracting any debt', () => {
    expect(figures(transactions).available).toBe(100000);
  });

  it('keeps a mortgage out of what falls due this month', () => {
    const { dueNow, longTerm } = figures(transactions);

    expect(dueNow).toBe(290000000);
    expect(longTerm).toBe(18000000000);
  });

  it('classifies both sides, so this month can be read against itself', () => {
    const { available, dueNow } = figures(transactions);

    expect(available).toBeLessThan(dueNow);
  });

  it('adds back up to every posting, whatever the balances are', () => {
    const cases = [
      transactions,
      [...transactions, opening('card', 295000000)],
      [...transactions, opening('savings', -9000000)],
    ];

    for (const txs of cases) {
      const { available, setAside, dueNow, longTerm } = figures(txs);

      expect(available + setAside - dueNow - longTerm).toBe(
        getTotalBalance(accounts, txs),
      );
    }
  });
});
