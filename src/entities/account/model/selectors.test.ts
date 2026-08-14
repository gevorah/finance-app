import { describe, expect, it } from 'vitest';

import type { Transaction } from '@/entities/transaction';

import { canDeleteAccount, getAccountPostingCount } from './selectors';

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
