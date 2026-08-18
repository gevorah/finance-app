import {
  Account,
  ACCOUNT_ROOTS,
  AccountRoot,
  OPENING_BALANCE_ACCOUNT_ID,
} from '@/entities/account';
import { Money } from '@/shared/lib/money';

import {
  Posting,
  Transaction,
  TRANSACTION_KINDS,
  TransactionKind,
} from './types';

export function getPostingsTotal(postings: Posting[]): Money {
  return postings.reduce((total, posting) => total + posting.amount, 0);
}

export function isBalanced(postings: Posting[]): boolean {
  return postings.length >= 2 && getPostingsTotal(postings) === 0;
}

export function getPostingFor(
  transaction: Transaction,
  accountId: string,
): Posting | undefined {
  return transaction.postings.find(
    (posting) => posting.accountId === accountId,
  );
}

export function touchesAccount(
  transaction: Transaction,
  accountId: string,
): boolean {
  return getPostingFor(transaction, accountId) !== undefined;
}

export interface TransactionDraft {
  amount: Money;
  /** Real account the money leaves from or arrives in. */
  accountId: string;
  /** Category account for expense and income, destination account for transfer. */
  counterAccountId: string;
}

/**
 * Money always leaves one account and arrives in another, so the two amounts
 * are mirror images and the transaction sums to zero. The direction is read
 * from the counter account's root, the same rule describeTransaction uses, so
 * writing and reading a transaction can never disagree about its type.
 */
export function buildPostings(
  { amount, accountId, counterAccountId }: TransactionDraft,
  accountsById: Map<string, Account>,
): Posting[] {
  const magnitude = Math.abs(amount);
  const moneyArrives =
    accountsById.get(counterAccountId)?.root === ACCOUNT_ROOTS.INCOME;

  return moneyArrives
    ? [
        { accountId: counterAccountId, amount: -magnitude },
        { accountId, amount: magnitude },
      ]
    : [
        { accountId, amount: -magnitude },
        { accountId: counterAccountId, amount: magnitude },
      ];
}

export interface OpeningBalanceDraft {
  accountId: string;
  /** What the account holds, or what is owed on it, always as a positive figure. */
  amount: Money;
  root: AccountRoot;
}

/**
 * An opening balance is what the account already held before the ledger existed,
 * so the other side is equity. An asset is debited and a liability credited, and
 * the direction cannot be read from the counter account because equity sits on
 * both sides.
 */
export function buildOpeningPostings({
  accountId,
  amount,
  root,
}: OpeningBalanceDraft): Posting[] {
  const magnitude = Math.abs(amount);
  const signed = root === ACCOUNT_ROOTS.LIABILITIES ? -magnitude : magnitude;

  return [
    { accountId, amount: signed },
    { accountId: OPENING_BALANCE_ACCOUNT_ID, amount: -signed },
  ];
}

export interface TransactionView {
  kind: TransactionKind;
  amount: Money;
  accountId: string;
  counterAccountId: string;
  counterPostings: Posting[];
  isSplit: boolean;
}

const byMagnitudeDesc = (a: Posting, b: Posting) =>
  Math.abs(b.amount) - Math.abs(a.amount);

const REAL_ROOTS: AccountRoot[] = [
  ACCOUNT_ROOTS.ASSETS,
  ACCOUNT_ROOTS.LIABILITIES,
];

/**
 * Firefly III derives the transaction type from the roots its postings touch
 * instead of storing it, and only lets the counter side be split — an expense
 * leaves one account and may land in several. Both rules are applied here, so
 * the amount is always the funding side rather than any single posting.
 */
export function describeTransaction(
  transaction: Transaction,
  accountsById: Map<string, Account>,
): TransactionView {
  const rootOf = (posting: Posting) =>
    accountsById.get(posting.accountId)?.root;

  const roots = new Set(transaction.postings.map(rootOf));

  const kind = roots.has(ACCOUNT_ROOTS.EQUITY)
    ? TRANSACTION_KINDS.OPENING
    : roots.has(ACCOUNT_ROOTS.INCOME)
      ? TRANSACTION_KINDS.INCOME
      : roots.has(ACCOUNT_ROOTS.EXPENSES)
        ? TRANSACTION_KINDS.EXPENSE
        : TRANSACTION_KINDS.TRANSFER;

  const amount = transaction.postings
    .filter((posting) => posting.amount < 0)
    .reduce((total, posting) => total - posting.amount, 0);

  const realPostings = transaction.postings.filter((posting) => {
    const root = rootOf(posting);
    return root !== undefined && REAL_ROOTS.includes(root);
  });

  const moneyArrives =
    kind === TRANSACTION_KINDS.INCOME || kind === TRANSACTION_KINDS.OPENING;
  const funding = realPostings.filter((posting) =>
    moneyArrives ? posting.amount > 0 : posting.amount < 0,
  );

  const accountId =
    [...(funding.length > 0 ? funding : realPostings)].sort(
      byMagnitudeDesc,
    )[0]?.accountId ?? '';

  const counterPostings = transaction.postings.filter(
    (posting) => posting.accountId !== accountId,
  );

  return {
    kind,
    amount,
    accountId,
    counterAccountId:
      [...counterPostings].sort(byMagnitudeDesc)[0]?.accountId ?? '',
    counterPostings,
    isSplit: counterPostings.length > 1,
  };
}

export type EditableKind = Exclude<
  TransactionKind,
  typeof TRANSACTION_KINDS.OPENING
>;

export function isEditableKind(
  kind: TransactionKind | undefined,
): kind is EditableKind {
  return kind !== undefined && kind !== TRANSACTION_KINDS.OPENING;
}
