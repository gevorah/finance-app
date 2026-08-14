import {
  DEFAULT_CASH_ACCOUNT_ID,
  DEFAULT_CHART_OF_ACCOUNTS,
  indexAccounts,
  DEFAULT_INCOME_ACCOUNT_ID,
  OPENING_BALANCE_ACCOUNT_ID,
  UNCATEGORIZED_EXPENSE_ACCOUNT_ID,
} from '@/entities/account';
import {
  PersistedRecord,
  readPersistedList,
  readPersistedMoney,
} from '@/shared/lib/persist';

import { buildPostings } from './ledger';
import { Transaction, TRANSACTION_KINDS, TransactionKind } from './types';

const LEGACY_CATEGORY_ACCOUNTS: Record<string, string> = {
  salary: DEFAULT_INCOME_ACCOUNT_ID,
  income: DEFAULT_INCOME_ACCOUNT_ID,
  other_income: 'income-other',
  food: 'expenses-food',
  bills: 'expenses-bills',
  shopping: 'expenses-shopping',
  health: 'expenses-health',
  transport: 'expenses-transport',
  others: UNCATEGORIZED_EXPENSE_ACCOUNT_ID,
};

function counterAccountFor(entry: PersistedRecord, kind: TransactionKind) {
  if (kind === TRANSACTION_KINDS.TRANSFER) {
    return String(entry.transferAccountId ?? DEFAULT_CASH_ACCOUNT_ID);
  }

  return (
    LEGACY_CATEGORY_ACCOUNTS[String(entry.category)] ??
    (kind === TRANSACTION_KINDS.INCOME
      ? DEFAULT_INCOME_ACCOUNT_ID
      : UNCATEGORIZED_EXPENSE_ACCOUNT_ID)
  );
}

const DEFAULT_ACCOUNTS_BY_ID = indexAccounts(DEFAULT_CHART_OF_ACCOUNTS);

/** Version 1 stored a single amount plus a type; version 2 stores balanced postings. */
export function migrateTransactionsToV2(persisted: unknown): {
  transactions: Transaction[];
} {
  const transactions = readPersistedList(persisted, 'transactions').map(
    (entry) => {
      const kind = (String(entry.type) as TransactionKind) ?? 'expense';
      const amount = Number(entry.amount) || 0;

      return {
        id: String(entry.id),
        date: String(entry.date),
        description: String(entry.description ?? ''),
        postings: buildPostings(
          {
            amount,
            accountId: String(entry.accountId ?? DEFAULT_CASH_ACCOUNT_ID),
            counterAccountId: counterAccountFor(entry, kind),
          },
          DEFAULT_ACCOUNTS_BY_ID,
        ),
        createdAt: String(entry.createdAt ?? new Date().toISOString()),
        updatedAt: String(entry.updatedAt ?? new Date().toISOString()),
      };
    },
  );

  return { transactions };
}

/**
 * Accounts used to carry an initialBalance field. In a ledger that number has
 * to come from somewhere, so it becomes a dated transaction against equity.
 */
export function buildOpeningBalance(
  accountId: string,
  amount: number,
  date: string,
): Transaction {
  const now = new Date().toISOString();
  return {
    id: `opening-${accountId}`,
    date,
    description: 'Opening balance',
    postings: [
      { accountId: OPENING_BALANCE_ACCOUNT_ID, amount: -amount },
      { accountId, amount },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

export function buildOpeningBalanceTransactions(
  persistedAccounts: unknown,
  date: string,
): Transaction[] {
  return readPersistedList(persistedAccounts, 'accounts')
    .filter((entry) => Number(entry.initialBalance) !== 0)
    .map((entry) =>
      buildOpeningBalance(
        String(entry.id),
        readPersistedMoney(entry.initialBalance),
        date,
      ),
    );
}

/** A debt owed is a negative balance on its liability account. */
export function buildDebtOpeningBalances(
  debts: { accountId: string; amountOwed: number; startDate: string }[],
  fallbackDate: string,
): Transaction[] {
  return debts.map((debt) =>
    buildOpeningBalance(
      debt.accountId,
      -debt.amountOwed,
      debt.startDate || fallbackDate,
    ),
  );
}
