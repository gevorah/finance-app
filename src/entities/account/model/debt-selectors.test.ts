import { buildOpeningPostings, type Transaction } from '@/entities/transaction';
import { toMinorUnits } from '@/shared/lib/money';
import { describe, expect, it } from 'vitest';

import {
  DEBT_STRATEGIES,
  getAmountOwed,
  getDebtStatus,
  getMonthlyInterestRate,
  getTotalDebt,
  orderDebtsByStrategy,
} from './debt-selectors';
import { DebtTerms } from './debt-terms';
import { Account, ACCOUNT_KINDS, ACCOUNT_ROOTS } from './types';

const CASH = 'assets-cash';

const liability = (
  id: string,
  rate: number,
  period: 'monthly' | 'yearly' = 'monthly',
  nextPaymentDueDate?: string,
): Account => ({
  id,
  name: id,
  root: ACCOUNT_ROOTS.LIABILITIES,
  kind: ACCOUNT_KINDS.LOAN,
  onBudget: true,
  debtTerms: {
    interest: rate === 0 ? { type: 'none' } : { type: 'fixed', rate, period },
    paymentTerms: {
      type: 'installments',
      installmentAmount: 0,
      frequency: 'monthly',
      nextPaymentDueDate,
    },
  } as DebtTerms,
  archived: false,
  createdAt: '',
  updatedAt: '',
});

const owe = (id: string, accountId: string, major: number): Transaction => ({
  id,
  date: '2026-08-01',
  description: id,
  postings: buildOpeningPostings({
    accountId,
    amount: toMinorUnits(major),
    root: ACCOUNT_ROOTS.LIABILITIES,
  }),
  createdAt: '',
  updatedAt: '',
});

const pay = (id: string, accountId: string, major: number): Transaction => ({
  id,
  date: '2026-08-10',
  description: id,
  postings: [
    { accountId: CASH, amount: -toMinorUnits(major) },
    { accountId, amount: toMinorUnits(major) },
  ],
  createdAt: '',
  updatedAt: '',
});

const small = liability('debt-small', 1.0);
const big = liability('debt-big', 2.5);
const yearly = liability('debt-yearly', 24, 'yearly');
const accounts = [small, big, yearly];

const transactions = [
  owe('o1', small.id, 500000),
  owe('o2', big.id, 3000000),
  owe('o3', yearly.id, 1000000),
];

describe('getAmountOwed', () => {
  it('reads the liability balance as a positive figure', () => {
    expect(getAmountOwed(small, transactions)).toBe(toMinorUnits(500000));
  });

  it('is owed, not settled, right after the debt is opened', () => {
    expect(getDebtStatus(small, transactions, '2026-08-14')).toBe('current');
  });

  it('goes down when a payment is registered, with nothing to edit by hand', () => {
    const afterPayment = [...transactions, pay('p1', small.id, 200000)];
    expect(getAmountOwed(small, afterPayment)).toBe(toMinorUnits(300000));
  });
});

describe('getDebtStatus', () => {
  it('is paid off once the balance reaches zero', () => {
    const settled = [...transactions, pay('p1', small.id, 500000)];
    expect(getDebtStatus(small, settled, '2026-08-14')).toBe('paid_off');
  });

  it('is late when the due date has passed', () => {
    const overdue = liability('debt-late', 1, 'monthly', '2026-08-01');
    expect(
      getDebtStatus(overdue, [owe('o', overdue.id, 100000)], '2026-08-14'),
    ).toBe('late');
  });

  it('is current when the due date is still ahead', () => {
    const upcoming = liability('debt-ok', 1, 'monthly', '2026-08-30');
    expect(
      getDebtStatus(upcoming, [owe('o', upcoming.id, 100000)], '2026-08-14'),
    ).toBe('current');
  });
});

describe('getMonthlyInterestRate', () => {
  it('compounds a yearly rate down instead of dividing it', () => {
    expect(getMonthlyInterestRate(yearly)).toBeCloseTo(1.8088, 4);
  });

  it('takes a monthly rate as it is, since it is already effective', () => {
    expect(getMonthlyInterestRate(big)).toBe(2.5);
  });

  it('does not tie a 24% yearly debt with a 2% monthly one', () => {
    const monthlyTwo = liability('debt-two', 2);

    expect(getMonthlyInterestRate(monthlyTwo)).toBeGreaterThan(
      getMonthlyInterestRate(yearly),
    );
  });
});

describe('orderDebtsByStrategy', () => {
  it('snowball puts the smallest balance first', () => {
    const order = orderDebtsByStrategy(
      accounts,
      transactions,
      DEBT_STRATEGIES.SNOWBALL,
    ).map((account) => account.id);

    expect(order).toEqual([small.id, yearly.id, big.id]);
  });

  it('avalanche puts the highest monthly rate first', () => {
    const order = orderDebtsByStrategy(
      accounts,
      transactions,
      DEBT_STRATEGIES.AVALANCHE,
    ).map((account) => account.id);

    expect(order).toEqual([big.id, yearly.id, small.id]);
  });

  it('leaves settled debts out of both orderings', () => {
    const settled = [...transactions, pay('p1', small.id, 500000)];
    const order = orderDebtsByStrategy(
      accounts,
      settled,
      DEBT_STRATEGIES.SNOWBALL,
    ).map((account) => account.id);

    expect(order).not.toContain(small.id);
  });
});

describe('getTotalDebt', () => {
  it('adds up what is still owed across every liability', () => {
    expect(getTotalDebt(accounts, transactions)).toBe(toMinorUnits(4500000));
  });
});
