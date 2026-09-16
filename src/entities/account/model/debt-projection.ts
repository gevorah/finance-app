import { Money } from '@/shared/lib/money';

export const PROJECTION_HORIZON_MONTHS = 600;

export const DEBT_STRATEGIES = {
  SNOWBALL: 'snowball',
  AVALANCHE: 'avalanche',
} as const;

export type DebtStrategy =
  (typeof DEBT_STRATEGIES)[keyof typeof DEBT_STRATEGIES];

export interface DebtPriority {
  id: string;
  balance: Money;
  monthlyRate: number;
}

export interface DebtSnapshot extends DebtPriority {
  minimumPayment: Money;
}

export type DebtProjectionIssueCode =
  | 'missing_payment_terms'
  | 'missing_payment_amount'
  | 'missing_interest_terms'
  | 'unknown_frequency'
  | 'unsupported_frequency';

export interface DebtProjectionIssue {
  accountId: string;
  code: DebtProjectionIssueCode;
}

export type ProjectionReadiness =
  | { status: 'ready'; debts: DebtSnapshot[] }
  | { status: 'incomplete'; issues: DebtProjectionIssue[] };

export interface DebtPayoff {
  id: string;
  interestPaid: Money;
  paidOffInMonth: number;
}

export interface StrategyProjection {
  strategy: DebtStrategy;
  order: string[];
  perDebt: DebtPayoff[];
  totalInterest: Money;
  months: number;
}

export type ProjectionOutcome =
  | {
      status: 'ok';
      committedPayment: Money;
      snowball: StrategyProjection;
      avalanche: StrategyProjection;
    }
  | { status: 'unsupported_negative_amortization'; accountIds: string[] }
  | {
      status: 'no_amortization';
      committedPayment: Money;
      monthlyInterest: Money;
    }
  | {
      status: 'horizon_exceeded';
      horizonMonths: number;
      strategies: DebtStrategy[];
    };

export function compareBySnowball(a: DebtPriority, b: DebtPriority): number {
  return (
    a.balance - b.balance ||
    b.monthlyRate - a.monthlyRate ||
    a.id.localeCompare(b.id)
  );
}

export function compareByAvalanche(a: DebtPriority, b: DebtPriority): number {
  return (
    b.monthlyRate - a.monthlyRate ||
    a.balance - b.balance ||
    a.id.localeCompare(b.id)
  );
}

function accrue(balance: Money, monthlyRate: number): Money {
  return Math.round(balance * monthlyRate);
}

interface DebtState {
  id: string;
  balance: Money;
  monthlyRate: number;
  minimumPayment: Money;
  due: Money;
  interestPaid: Money;
  paidOffInMonth: number;
}

function simulate(
  debts: DebtSnapshot[],
  committedPayment: Money,
  strategy: DebtStrategy,
  compare: (a: DebtPriority, b: DebtPriority) => number,
): StrategyProjection | undefined {
  const state: DebtState[] = [...debts]
    .sort(compare)
    .map((debt) => ({ ...debt, due: 0, interestPaid: 0, paidOffInMonth: 0 }));

  let month = 0;

  while (state.some((debt) => debt.balance > 0)) {
    month += 1;
    if (month > PROJECTION_HORIZON_MONTHS) return undefined;

    const active = state.filter((debt) => debt.balance > 0);

    let spent = 0;
    for (const debt of active) {
      debt.due = debt.balance + accrue(debt.balance, debt.monthlyRate);
      debt.interestPaid += debt.due - debt.balance;
    }

    for (const debt of active) {
      const payment = Math.min(debt.minimumPayment, debt.due);
      debt.due -= payment;
      spent += payment;
    }

    let surplus = committedPayment - spent;
    for (const debt of active) {
      if (surplus <= 0) break;
      const payment = Math.min(surplus, debt.due);
      debt.due -= payment;
      surplus -= payment;
    }

    for (const debt of active) {
      debt.balance = debt.due;
      if (debt.balance === 0) debt.paidOffInMonth = month;
    }
  }

  return {
    strategy,
    order: state.map((debt) => debt.id),
    perDebt: state.map(({ id, interestPaid, paidOffInMonth }) => ({
      id,
      interestPaid,
      paidOffInMonth,
    })),
    totalInterest: state.reduce((total, debt) => total + debt.interestPaid, 0),
    months: month,
  };
}

const EMPTY_PROJECTION = (strategy: DebtStrategy): StrategyProjection => ({
  strategy,
  order: [],
  perDebt: [],
  totalInterest: 0,
  months: 0,
});

export function projectStrategies(
  debts: DebtSnapshot[],
  extraPayment: Money,
): ProjectionOutcome {
  const committedPayment =
    debts.reduce((total, debt) => total + debt.minimumPayment, 0) +
    extraPayment;

  if (debts.length === 0) {
    return {
      status: 'ok',
      committedPayment,
      snowball: EMPTY_PROJECTION(DEBT_STRATEGIES.SNOWBALL),
      avalanche: EMPTY_PROJECTION(DEBT_STRATEGIES.AVALANCHE),
    };
  }

  const underwater = debts.filter(
    (debt) => debt.minimumPayment < accrue(debt.balance, debt.monthlyRate),
  );
  if (underwater.length > 0) {
    return {
      status: 'unsupported_negative_amortization',
      accountIds: underwater.map((debt) => debt.id),
    };
  }

  const monthlyInterest = debts.reduce(
    (total, debt) => total + accrue(debt.balance, debt.monthlyRate),
    0,
  );
  if (committedPayment <= monthlyInterest) {
    return { status: 'no_amortization', committedPayment, monthlyInterest };
  }

  const snowball = simulate(
    debts,
    committedPayment,
    DEBT_STRATEGIES.SNOWBALL,
    compareBySnowball,
  );
  const avalanche = simulate(
    debts,
    committedPayment,
    DEBT_STRATEGIES.AVALANCHE,
    compareByAvalanche,
  );

  if (!snowball || !avalanche) {
    return {
      status: 'horizon_exceeded',
      horizonMonths: PROJECTION_HORIZON_MONTHS,
      strategies: [
        ...(snowball ? [] : [DEBT_STRATEGIES.SNOWBALL]),
        ...(avalanche ? [] : [DEBT_STRATEGIES.AVALANCHE]),
      ],
    };
  }

  return { status: 'ok', committedPayment, snowball, avalanche };
}
