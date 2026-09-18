import { buildOpeningPostings, type Transaction } from '@/entities/transaction';
import { toMinorUnits } from '@/shared/lib/money';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { DEBT_STRATEGIES, DebtStrategy } from './debt-projection';
import {
  buildProjectionReadiness,
  getAmountOwed,
  getDebtPayoffProgress,
  getDebtStatus,
  getMonthlyInterestRate,
  getMonthlyPayment,
  getTotalDebt,
  orderDebtsByStrategy,
} from './debt-selectors';
import { DebtInterest, DebtTerms } from './debt-terms';
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

describe('getDebtStatus without a given day, at night in Bogota', () => {
  beforeAll(() => {
    vi.stubEnv('TZ', 'America/Bogota');
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-15T03:00:00.000Z'));
  });

  afterAll(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it('is current, not late, when the due date is the local today', () => {
    const dueToday = liability('debt-due-today', 1, 'monthly', '2026-08-14');

    expect(getDebtStatus(dueToday, [owe('o', dueToday.id, 100000)])).toBe(
      'current',
    );
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

describe('getDebtPayoffProgress', () => {
  const cash: Account = {
    id: CASH,
    name: 'cash',
    root: ACCOUNT_ROOTS.ASSETS,
    kind: ACCOUNT_KINDS.CASH,
    onBudget: true,
    archived: false,
    createdAt: '',
    updatedAt: '',
  };

  it('reads a repayment as progress and what it settles as the baseline', () => {
    expect(
      getDebtPayoffProgress(
        [small],
        [owe('o1', small.id, 500000), pay('p1', small.id, 200000)],
      ),
    ).toEqual({
      borrowed: toMinorUnits(500000),
      repaid: toMinorUnits(200000),
      percentage: 40,
    });
  });

  it('grows the baseline with every later charge, not just the opening one', () => {
    expect(
      getDebtPayoffProgress(
        [small],
        [
          owe('o1', small.id, 400000),
          owe('o2', small.id, 100000),
          pay('p1', small.id, 250000),
        ],
      ),
    ).toEqual({
      borrowed: toMinorUnits(500000),
      repaid: toMinorUnits(250000),
      percentage: 50,
    });
  });

  it('pools every debt account into one figure', () => {
    expect(
      getDebtPayoffProgress(accounts, [
        ...transactions,
        pay('p1', small.id, 500000),
        pay('p2', big.id, 400000),
      ]),
    ).toEqual({
      borrowed: toMinorUnits(4500000),
      repaid: toMinorUnits(900000),
      percentage: 20,
    });
  });

  it.each([
    [100000, 33],
    [200000, 67],
  ])('rounds a %d repayment of 300000 to a whole percent', (paid, percent) => {
    expect(
      getDebtPayoffProgress(
        [small],
        [owe('o1', small.id, 300000), pay('p1', small.id, paid)],
      ).percentage,
    ).toBe(percent);
  });

  it('caps the share at 100 when more came back than went out', () => {
    expect(
      getDebtPayoffProgress(
        [small],
        [owe('o1', small.id, 500000), pay('p1', small.id, 800000)],
      ),
    ).toEqual({
      borrowed: toMinorUnits(500000),
      repaid: toMinorUnits(800000),
      percentage: 100,
    });
  });

  it('reports a flat zero rather than dividing by nothing', () => {
    const nothing = { borrowed: 0, repaid: 0, percentage: 0 };

    expect(getDebtPayoffProgress([], transactions)).toEqual(nothing);
    expect(getDebtPayoffProgress(accounts, [])).toEqual(nothing);
    expect(getDebtPayoffProgress([cash], transactions)).toEqual(nothing);
  });

  it('ignores the cash side of a payment, which is not borrowing', () => {
    expect(
      getDebtPayoffProgress(
        [cash, small],
        [owe('o1', small.id, 500000), pay('p1', small.id, 200000)],
      ),
    ).toEqual({
      borrowed: toMinorUnits(500000),
      repaid: toMinorUnits(200000),
      percentage: 40,
    });
  });

  it('leaves an archived debt out of the progress it reports', () => {
    const closed = { ...liability('debt-closed', 1), archived: true };

    expect(
      getDebtPayoffProgress(
        [closed],
        [owe('o1', closed.id, 500000), pay('p1', closed.id, 200000)],
      ),
    ).toEqual({ borrowed: 0, repaid: 0, percentage: 0 });
  });
});

const debt = (id: string, debtTerms: DebtTerms | undefined): Account => ({
  id,
  name: id,
  root: ACCOUNT_ROOTS.LIABILITIES,
  kind: ACCOUNT_KINDS.LOAN,
  onBudget: true,
  debtTerms,
  archived: false,
  createdAt: '',
  updatedAt: '',
});

const monthlyFixed = (rate: number): DebtInterest => ({
  type: 'fixed',
  rate,
  period: 'monthly',
});

const readinessOf = (account: Account) =>
  buildProjectionReadiness(
    [account],
    [owe(`${account.id}-open`, account.id, 1000)],
  );

describe('buildProjectionReadiness', () => {
  it('accepts monthly installments and reads the rate as a fraction', () => {
    const readiness = readinessOf(
      debt('loan', {
        interest: monthlyFixed(2.5),
        paymentTerms: {
          type: 'installments',
          installmentAmount: toMinorUnits(200),
          frequency: 'monthly',
        },
      }),
    );

    expect(readiness).toEqual({
      status: 'ready',
      debts: [
        {
          id: 'loan',
          balance: toMinorUnits(1000),
          monthlyRate: 0.025,
          minimumPayment: toMinorUnits(200),
        },
      ],
    });
  });

  it('accepts revolving terms', () => {
    const readiness = readinessOf(
      debt('card', {
        interest: monthlyFixed(3),
        paymentTerms: {
          type: 'revolving',
          minimumPayment: toMinorUnits(150),
        },
      }),
    );

    expect(readiness.status).toBe('ready');
  });

  it('accepts flexible terms when the amount is present', () => {
    const readiness = readinessOf(
      debt('friend', {
        interest: { type: 'none' },
        paymentTerms: {
          type: 'flexible',
          suggestedPaymentAmount: toMinorUnits(100),
        },
      }),
    );

    expect(readiness).toMatchObject({
      status: 'ready',
      debts: [{ monthlyRate: 0, minimumPayment: toMinorUnits(100) }],
    });
  });

  it('reads a declared absence of interest as a zero rate', () => {
    const readiness = readinessOf(
      debt('free', {
        interest: { type: 'none' },
        paymentTerms: {
          type: 'revolving',
          minimumPayment: toMinorUnits(50),
        },
      }),
    );

    expect(readiness).toMatchObject({
      status: 'ready',
      debts: [{ monthlyRate: 0 }],
    });
  });

  it.each([
    ['terms missing altogether', undefined, 'missing_payment_terms'],
    [
      'installments without a frequency',
      {
        interest: monthlyFixed(2),
        paymentTerms: {
          type: 'installments' as const,
          installmentAmount: toMinorUnits(200),
        },
      },
      'unknown_frequency',
    ],
    [
      'a frequency the monthly model cannot carry',
      {
        interest: monthlyFixed(2),
        paymentTerms: {
          type: 'installments' as const,
          installmentAmount: toMinorUnits(200),
          frequency: 'weekly' as const,
        },
      },
      'unsupported_frequency',
    ],
    [
      'flexible terms with no amount',
      {
        interest: monthlyFixed(2),
        paymentTerms: { type: 'flexible' as const },
      },
      'missing_payment_amount',
    ],
    [
      'a minimum that rounds down to nothing',
      {
        interest: monthlyFixed(2),
        paymentTerms: {
          type: 'revolving' as const,
          minimumPayment: toMinorUnits(0.001),
        },
      },
      'missing_payment_amount',
    ],
  ])('reports %s', (_label, terms, code) => {
    const readiness = readinessOf(debt('broken', terms as DebtTerms));

    expect(readiness).toEqual({
      status: 'incomplete',
      issues: [{ accountId: 'broken', code }],
    });
  });

  it('guards against stored terms that carry no interest', () => {
    const readiness = readinessOf(
      debt('legacy', {
        paymentTerms: {
          type: 'revolving',
          minimumPayment: toMinorUnits(150),
        },
      } as unknown as DebtTerms),
    );

    expect(readiness).toEqual({
      status: 'incomplete',
      issues: [{ accountId: 'legacy', code: 'missing_interest_terms' }],
    });
  });

  it('reports every issue a debt has', () => {
    const readiness = readinessOf(
      debt('messy', {
        interest: monthlyFixed(2),
        paymentTerms: { type: 'installments', frequency: 'yearly' },
      }),
    );

    expect(readiness).toEqual({
      status: 'incomplete',
      issues: [
        { accountId: 'messy', code: 'unsupported_frequency' },
        { accountId: 'messy', code: 'missing_payment_amount' },
      ],
    });
  });

  it('returns no projection at all when one debt of several is incomplete', () => {
    const good = debt('good', {
      interest: monthlyFixed(2),
      paymentTerms: { type: 'revolving', minimumPayment: toMinorUnits(100) },
    });
    const bad = debt('bad', undefined);

    const readiness = buildProjectionReadiness(
      [good, bad],
      [owe('o1', good.id, 1000), owe('o2', bad.id, 500)],
    );

    expect(readiness).toEqual({
      status: 'incomplete',
      issues: [{ accountId: 'bad', code: 'missing_payment_terms' }],
    });
  });

  it('leaves settled debts out', () => {
    const account = debt('settled', {
      interest: monthlyFixed(2),
      paymentTerms: { type: 'revolving', minimumPayment: toMinorUnits(100) },
    });

    const readiness = buildProjectionReadiness(
      [account],
      [owe('o1', account.id, 1000), pay('p1', account.id, 1000)],
    );

    expect(readiness).toEqual({ status: 'ready', debts: [] });
  });

  it('is ready with nothing to project when there are no debts', () => {
    expect(buildProjectionReadiness([], [])).toEqual({
      status: 'ready',
      debts: [],
    });
  });
});

describe('orderDebtsByStrategy tie-breaking', () => {
  const sameBalance = [liability('b-low', 1), liability('a-high', 3)];
  const sameBalanceOwed = [
    owe('t1', 'b-low', 400000),
    owe('t2', 'a-high', 400000),
  ];

  const sameRate = [liability('b-big', 2), liability('a-small', 2)];
  const sameRateOwed = [
    owe('t1', 'b-big', 900000),
    owe('t2', 'a-small', 200000),
  ];

  const orderOf = (
    accounts: Account[],
    transactions: Transaction[],
    strategy: DebtStrategy,
  ) =>
    orderDebtsByStrategy(accounts, transactions, strategy).map(
      (account) => account.id,
    );

  it('breaks equal balances by the higher rate under snowball', () => {
    expect(
      orderOf(sameBalance, sameBalanceOwed, DEBT_STRATEGIES.SNOWBALL),
    ).toEqual(['a-high', 'b-low']);
  });

  it('breaks equal rates by the smaller balance under avalanche', () => {
    expect(orderOf(sameRate, sameRateOwed, DEBT_STRATEGIES.AVALANCHE)).toEqual([
      'a-small',
      'b-big',
    ]);
  });

  it('breaks a full tie by id, whatever order the accounts arrive in', () => {
    const tied = [liability('b-tied', 2), liability('a-tied', 2)];
    const owed = [owe('t1', 'b-tied', 500000), owe('t2', 'a-tied', 500000)];

    for (const strategy of Object.values(DEBT_STRATEGIES)) {
      expect(orderOf(tied, owed, strategy)).toEqual(['a-tied', 'b-tied']);
      expect(orderOf([...tied].reverse(), owed, strategy)).toEqual([
        'a-tied',
        'b-tied',
      ]);
    }
  });
});

describe('getMonthlyPayment', () => {
  it('reads a monthly instalment', () => {
    expect(
      getMonthlyPayment(
        debt('loan', {
          interest: monthlyFixed(2),
          paymentTerms: {
            type: 'installments',
            installmentAmount: toMinorUnits(200),
            frequency: 'monthly',
          },
        }),
      ),
    ).toBe(toMinorUnits(200));
  });

  it.each([['weekly'], ['yearly'], ['custom']] as const)(
    'refuses to report a %s instalment as monthly',
    (frequency) => {
      expect(
        getMonthlyPayment(
          debt('loan', {
            interest: monthlyFixed(2),
            paymentTerms: {
              type: 'installments',
              installmentAmount: toMinorUnits(200),
              frequency,
            },
          }),
        ),
      ).toBeUndefined();
    },
  );

  it('refuses an instalment whose cadence is unknown', () => {
    expect(
      getMonthlyPayment(
        debt('loan', {
          interest: monthlyFixed(2),
          paymentTerms: {
            type: 'installments',
            installmentAmount: toMinorUnits(200),
          },
        }),
      ),
    ).toBeUndefined();
  });

  it('reads revolving and flexible amounts, which carry no other cadence', () => {
    expect(
      getMonthlyPayment(
        debt('card', {
          interest: monthlyFixed(3),
          paymentTerms: {
            type: 'revolving',
            minimumPayment: toMinorUnits(150),
          },
        }),
      ),
    ).toBe(toMinorUnits(150));

    expect(
      getMonthlyPayment(
        debt('friend', {
          interest: { type: 'none' },
          paymentTerms: {
            type: 'flexible',
            suggestedPaymentAmount: toMinorUnits(100),
          },
        }),
      ),
    ).toBe(toMinorUnits(100));
  });

  it('has nothing to report without terms or without an amount', () => {
    expect(getMonthlyPayment(debt('bare', undefined))).toBeUndefined();
    expect(
      getMonthlyPayment(
        debt('empty', {
          interest: monthlyFixed(2),
          paymentTerms: { type: 'revolving' },
        }),
      ),
    ).toBeUndefined();
  });

  it('treats a minimum that rounds down to nothing as absent', () => {
    expect(
      getMonthlyPayment(
        debt('dust', {
          interest: monthlyFixed(2),
          paymentTerms: {
            type: 'revolving',
            minimumPayment: toMinorUnits(0.001),
          },
        }),
      ),
    ).toBeUndefined();
  });
});
