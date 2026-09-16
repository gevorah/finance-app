import { describe, expect, it } from 'vitest';

import {
  compareByAvalanche,
  compareBySnowball,
  DebtPriority,
  DebtSnapshot,
  PROJECTION_HORIZON_MONTHS,
  ProjectionOutcome,
  projectStrategies,
} from './debt-projection';

const priority = (
  id: string,
  balance: number,
  monthlyRate: number,
): DebtPriority => ({ id, balance, monthlyRate });

const order = (
  debts: DebtPriority[],
  compare: (a: DebtPriority, b: DebtPriority) => number,
): string[] => [...debts].sort(compare).map((debt) => debt.id);

describe('compareBySnowball', () => {
  it('puts the smallest balance first', () => {
    const debts = [priority('big', 900, 0.05), priority('small', 100, 0.01)];

    expect(order(debts, compareBySnowball)).toEqual(['small', 'big']);
  });

  it('breaks equal balances by the higher rate', () => {
    const debts = [priority('cheap', 500, 0.01), priority('costly', 500, 0.04)];

    expect(order(debts, compareBySnowball)).toEqual(['costly', 'cheap']);
  });

  it('breaks a full tie by id, whatever the input order', () => {
    const debts = [priority('b', 500, 0.02), priority('a', 500, 0.02)];

    expect(order(debts, compareBySnowball)).toEqual(['a', 'b']);
    expect(order([...debts].reverse(), compareBySnowball)).toEqual(['a', 'b']);
  });
});

describe('compareByAvalanche', () => {
  it('puts the highest rate first', () => {
    const debts = [priority('cheap', 100, 0.01), priority('costly', 900, 0.05)];

    expect(order(debts, compareByAvalanche)).toEqual(['costly', 'cheap']);
  });

  it('breaks equal rates by the smaller balance', () => {
    const debts = [priority('big', 900, 0.03), priority('small', 100, 0.03)];

    expect(order(debts, compareByAvalanche)).toEqual(['small', 'big']);
  });

  it('breaks a full tie by id, whatever the input order', () => {
    const debts = [priority('b', 500, 0.02), priority('a', 500, 0.02)];

    expect(order(debts, compareByAvalanche)).toEqual(['a', 'b']);
    expect(order([...debts].reverse(), compareByAvalanche)).toEqual(['a', 'b']);
  });
});

const snapshot = (
  id: string,
  balance: number,
  monthlyRate: number,
  minimumPayment: number,
): DebtSnapshot => ({ id, balance, monthlyRate, minimumPayment });

const expectOk = (outcome: ProjectionOutcome) => {
  if (outcome.status !== 'ok') {
    throw new Error(`expected an ok projection, got ${outcome.status}`);
  }

  return outcome;
};

describe('projectStrategies', () => {
  it('amortises a single interest-free debt in whole payments', () => {
    const { snowball, avalanche } = expectOk(
      projectStrategies([snapshot('loan', 10000, 0, 2500)], 0),
    );

    expect(snowball).toMatchObject({ months: 4, totalInterest: 0 });
    expect(avalanche).toEqual({ ...snowball, strategy: 'avalanche' });
  });

  it('charges interest on the opening balance of each month', () => {
    const { snowball } = expectOk(
      projectStrategies([snapshot('loan', 1000, 0.1, 600)], 0),
    );

    expect(snowball).toMatchObject({
      months: 2,
      totalInterest: 150,
      perDebt: [{ id: 'loan', interestPaid: 150, paidOffInMonth: 2 }],
    });
  });

  it('commits the minimums plus the extra payment', () => {
    const outcome = expectOk(
      projectStrategies(
        [snapshot('a', 1000, 0, 100), snapshot('b', 1000, 0, 250)],
        400,
      ),
    );

    expect(outcome.committedPayment).toBe(750);
  });

  it('rolls a settled debt payment into the rest of the plan', () => {
    const { snowball } = expectOk(
      projectStrategies(
        [snapshot('small', 100, 0, 100), snapshot('big', 1000, 0, 100)],
        0,
      ),
    );

    expect(snowball).toMatchObject({
      months: 6,
      perDebt: [
        { id: 'small', paidOffInMonth: 1 },
        { id: 'big', paidOffInMonth: 6 },
      ],
    });
  });

  it('cascades the surplus onto the next debt within the same month', () => {
    const { snowball } = expectOk(
      projectStrategies(
        [snapshot('small', 50, 0, 50), snapshot('big', 1000, 0, 50)],
        200,
      ),
    );

    expect(snowball.perDebt).toEqual([
      { id: 'small', interestPaid: 0, paidOffInMonth: 1 },
      { id: 'big', interestPaid: 0, paidOffInMonth: 4 },
    ]);
  });

  it('leaves the surplus of the final month unused instead of overpaying', () => {
    const { snowball } = expectOk(
      projectStrategies([snapshot('loan', 150, 0, 100)], 0),
    );

    expect(snowball).toMatchObject({ months: 2, totalInterest: 0 });
  });

  it('pays less interest under avalanche when the orders diverge', () => {
    const debts = [
      snapshot('big', 1000, 0.05, 60),
      snapshot('small', 500, 0.01, 60),
    ];
    const { snowball, avalanche } = expectOk(projectStrategies(debts, 100));

    expect(snowball.order).toEqual(['small', 'big']);
    expect(avalanche.order).toEqual(['big', 'small']);
    expect(avalanche.totalInterest).toBeLessThan(snowball.totalInterest);
  });

  it('reports the debts whose minimum cannot cover their own interest', () => {
    const outcome = projectStrategies(
      [snapshot('sinking', 1000, 0.1, 50), snapshot('fine', 1000, 0, 100)],
      0,
    );

    expect(outcome).toEqual({
      status: 'unsupported_negative_amortization',
      accountIds: ['sinking'],
    });
  });

  it('refuses a plan that only ever covers the interest', () => {
    const outcome = projectStrategies([snapshot('loan', 1000, 0.1, 100)], 0);

    expect(outcome).toEqual({
      status: 'no_amortization',
      committedPayment: 100,
      monthlyInterest: 100,
    });
  });

  it('accepts the same plan once any extra payment is added', () => {
    const outcome = projectStrategies([snapshot('loan', 100, 0.1, 10)], 5);

    expect(outcome.status).toBe('ok');
  });

  it('stops at the horizon and names the strategies that reached it', () => {
    const outcome = projectStrategies(
      [snapshot('endless', 10_000_000, 0, 1)],
      0,
    );

    expect(outcome).toEqual({
      status: 'horizon_exceeded',
      horizonMonths: PROJECTION_HORIZON_MONTHS,
      strategies: ['snowball', 'avalanche'],
    });
  });

  /**
   * Minimums that barely clear their own interest plus a small extra: the very
   * shape the horizon exists for. Avalanche lands inside it, snowball does not.
   */
  it('names only the strategy that reached the horizon', () => {
    const outcome = projectStrategies(
      [
        snapshot('A', 500_000, 0.001, 700),
        snapshot('B', 1_000_000, 0.002, 2_200),
      ],
      1_000,
    );

    expect(outcome).toEqual({
      status: 'horizon_exceeded',
      horizonMonths: PROJECTION_HORIZON_MONTHS,
      strategies: ['snowball'],
    });
  });

  it('projects nothing when there is nothing owed', () => {
    const outcome = expectOk(projectStrategies([], 0));

    expect(outcome.snowball).toMatchObject({
      months: 0,
      totalInterest: 0,
      order: [],
    });
  });

  it('is deterministic and leaves the snapshots untouched', () => {
    const debts = [
      Object.freeze(snapshot('a', 1000, 0.02, 200)),
      Object.freeze(snapshot('b', 700, 0.01, 150)),
    ];
    Object.freeze(debts);

    expect(projectStrategies(debts, 300)).toEqual(
      projectStrategies(debts, 300),
    );
    expect(debts[0]).toEqual(snapshot('a', 1000, 0.02, 200));
  });

  it('keeps every figure an exact number of minor units', () => {
    const { snowball } = expectOk(
      projectStrategies(
        [
          snapshot('a', 123_457, 0.0237, 9_999),
          snapshot('b', 77_003, 0.0119, 4_001),
        ],
        1_777,
      ),
    );

    const sumPerDebt = snowball.perDebt.reduce(
      (total, debt) => total + debt.interestPaid,
      0,
    );

    expect(sumPerDebt).toBe(snowball.totalInterest);
    expect(
      snowball.perDebt.every((debt) => Number.isSafeInteger(debt.interestPaid)),
    ).toBe(true);
    expect(snowball.perDebt.every((debt) => debt.paidOffInMonth > 0)).toBe(
      true,
    );
  });
});
