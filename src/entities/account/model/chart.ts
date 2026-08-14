import {
  Account,
  ACCOUNT_KINDS,
  ACCOUNT_ROOTS,
  DEFAULT_CASH_ACCOUNT_ID,
  DEFAULT_INCOME_ACCOUNT_ID,
  OPENING_BALANCE_ACCOUNT_ID,
  UNCATEGORIZED_EXPENSE_ACCOUNT_ID,
} from './types';

const EPOCH = '1970-01-01T00:00:00.000Z';

const account = (
  id: string,
  name: string,
  root: Account['root'],
  extra: Partial<Account> = {},
): Account => ({
  id,
  name,
  root,
  onBudget: root !== ACCOUNT_ROOTS.EQUITY,
  archived: false,
  createdAt: EPOCH,
  updatedAt: EPOCH,
  ...extra,
});

export const DEFAULT_CHART_OF_ACCOUNTS: Account[] = [
  account(OPENING_BALANCE_ACCOUNT_ID, 'Opening balances', ACCOUNT_ROOTS.EQUITY),
  account(DEFAULT_CASH_ACCOUNT_ID, 'Cash', ACCOUNT_ROOTS.ASSETS, {
    kind: ACCOUNT_KINDS.CASH,
  }),
  account(DEFAULT_INCOME_ACCOUNT_ID, 'Salary', ACCOUNT_ROOTS.INCOME),
  account('income-other', 'Other income', ACCOUNT_ROOTS.INCOME),
  account('expenses-food', 'Food & Drinks', ACCOUNT_ROOTS.EXPENSES),
  account('expenses-bills', 'Bills', ACCOUNT_ROOTS.EXPENSES),
  account('expenses-shopping', 'Shopping', ACCOUNT_ROOTS.EXPENSES),
  account('expenses-health', 'Health', ACCOUNT_ROOTS.EXPENSES),
  account('expenses-transport', 'Transport', ACCOUNT_ROOTS.EXPENSES),
  account('expenses-interest', 'Interest & fees', ACCOUNT_ROOTS.EXPENSES),
  account(UNCATEGORIZED_EXPENSE_ACCOUNT_ID, 'Others', ACCOUNT_ROOTS.EXPENSES),
];
