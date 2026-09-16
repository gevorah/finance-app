import type { Transaction } from '@/entities/transaction';
import { Money } from '@/shared/lib/money';

import {
  compareByAvalanche,
  compareBySnowball,
  DEBT_STRATEGIES,
  DebtPriority,
  DebtProjectionIssue,
  DebtProjectionIssueCode,
  DebtSnapshot,
  DebtStrategy,
  ProjectionReadiness,
} from './debt-projection';
import { DebtInterest, DebtPaymentTerms, DebtStatus } from './debt-terms';
import { getAccountBalance } from './selectors';
import { Account, ACCOUNT_ROOTS } from './types';

/** What is owed is the account balance read as a positive figure. */
export function getAmountOwed(
  account: Account,
  transactions: Transaction[],
): Money {
  return -getAccountBalance(account, transactions);
}

export function getDebtAccounts(accounts: Account[]): Account[] {
  return accounts.filter(
    (account) =>
      account.root === ACCOUNT_ROOTS.LIABILITIES && !account.archived,
  );
}

export function getDebtStatus(
  account: Account,
  transactions: Transaction[],
  today: string = new Date().toISOString().slice(0, 10),
): DebtStatus {
  if (getAmountOwed(account, transactions) <= 0) return 'paid_off';

  const dueDate = account.debtTerms?.paymentTerms.nextPaymentDueDate;
  if (dueDate && dueDate < today) return 'late';

  return 'current';
}

export function getTotalDebt(
  accounts: Account[],
  transactions: Transaction[],
): Money {
  return getDebtAccounts(accounts).reduce(
    (total, account) =>
      total + Math.max(getAmountOwed(account, transactions), 0),
    0,
  );
}

/**
 * A yearly rate is quoted as an effective annual rate, so its monthly
 * equivalent compounds rather than divides. Dividing by twelve overstates it,
 * and orders two debts the wrong way round when one of them is quoted monthly.
 */
export function getMonthlyInterestRate(account: Account): number {
  const interest = account.debtTerms?.interest;
  if (!interest || interest.type === 'none') return 0;
  if (interest.period === 'monthly') return interest.rate;

  return ((1 + interest.rate / 100) ** (1 / 12) - 1) * 100;
}

export function toDebtPriority(
  account: Account,
  transactions: Transaction[],
): DebtPriority {
  return {
    id: account.id,
    balance: getAmountOwed(account, transactions),
    monthlyRate: getMonthlyInterestRate(account) / 100,
  };
}

function getOutstandingDebts(
  accounts: Account[],
  transactions: Transaction[],
): Account[] {
  return getDebtAccounts(accounts).filter(
    (account) => getAmountOwed(account, transactions) > 0,
  );
}

function getMonthlyMinimumPayment(terms: DebtPaymentTerms): Money | undefined {
  if (terms.type === 'installments') return terms.installmentAmount;
  if (terms.type === 'revolving') return terms.minimumPayment;

  return terms.suggestedPaymentAmount;
}

function getFrequencyIssue(
  terms: DebtPaymentTerms,
): DebtProjectionIssueCode | undefined {
  if (terms.type !== 'installments') return undefined;
  if (!terms.frequency) return 'unknown_frequency';
  if (terms.frequency !== 'monthly') return 'unsupported_frequency';

  return undefined;
}

export function getMonthlyPayment(account: Account): Money | undefined {
  const terms = account.debtTerms?.paymentTerms;
  if (!terms || getFrequencyIssue(terms)) return undefined;

  const amount = getMonthlyMinimumPayment(terms);

  return amount && amount > 0 ? amount : undefined;
}

type DebtEvaluation =
  | { simulatable: true; minimumPayment: Money }
  | { simulatable: false; codes: DebtProjectionIssueCode[] };

function evaluateDebt(account: Account): DebtEvaluation {
  const terms = account.debtTerms;
  if (!terms?.paymentTerms) {
    return { simulatable: false, codes: ['missing_payment_terms'] };
  }

  const codes: DebtProjectionIssueCode[] = [];

  const interest: DebtInterest | undefined = terms.interest;
  if (!interest) codes.push('missing_interest_terms');

  const frequencyIssue = getFrequencyIssue(terms.paymentTerms);
  if (frequencyIssue) codes.push(frequencyIssue);

  const minimumPayment = getMonthlyMinimumPayment(terms.paymentTerms);
  if (!minimumPayment || minimumPayment <= 0) {
    codes.push('missing_payment_amount');
  }

  if (codes.length > 0 || !minimumPayment) {
    return { simulatable: false, codes };
  }

  return { simulatable: true, minimumPayment };
}

export function buildProjectionReadiness(
  accounts: Account[],
  transactions: Transaction[],
): ProjectionReadiness {
  const issues: DebtProjectionIssue[] = [];
  const debts: DebtSnapshot[] = [];

  for (const account of getOutstandingDebts(accounts, transactions)) {
    const evaluation = evaluateDebt(account);

    if (!evaluation.simulatable) {
      issues.push(
        ...evaluation.codes.map((code) => ({ accountId: account.id, code })),
      );
      continue;
    }

    debts.push({
      ...toDebtPriority(account, transactions),
      minimumPayment: evaluation.minimumPayment,
    });
  }

  return issues.length > 0
    ? { status: 'incomplete', issues }
    : { status: 'ready', debts };
}

/**
 * Snowball pays the smallest balance first, avalanche the highest rate. Both
 * are orderings of the same accounts, so neither needs a stored priority.
 */
export function orderDebtsByStrategy(
  accounts: Account[],
  transactions: Transaction[],
  strategy: DebtStrategy,
): Account[] {
  const compare =
    strategy === DEBT_STRATEGIES.AVALANCHE
      ? compareByAvalanche
      : compareBySnowball;

  return getOutstandingDebts(accounts, transactions)
    .map((account) => ({
      account,
      priority: toDebtPriority(account, transactions),
    }))
    .sort((a, b) => compare(a.priority, b.priority))
    .map(({ account }) => account);
}
