import { DEFAULT_ACCOUNT_ID } from '@/entities/account';
import { Budget } from '@/entities/budget';
import { CATEGORY_TYPES, CategoryType } from '@/entities/category';
import { Debt } from '@/entities/debt';
import { Transaction, TransactionType } from '@/entities/transaction';
import { toMinorUnits } from '@/shared/lib/money';

const LEGACY_CATEGORY_IDS: Record<string, CategoryType> = {
  income: CATEGORY_TYPES.SALARY,
  food: CATEGORY_TYPES.FOOD,
  bills: CATEGORY_TYPES.BILLS,
  shopping: CATEGORY_TYPES.SHOPPING,
  health: CATEGORY_TYPES.HEALTH,
  transport: CATEGORY_TYPES.TRANSPORT,
  others: CATEGORY_TYPES.OTHERS,
};

type LegacyRecord = Record<string, unknown>;

function readList(persisted: unknown, key: string): LegacyRecord[] {
  const list = (persisted as Record<string, unknown> | undefined)?.[key];
  return Array.isArray(list) ? (list as LegacyRecord[]) : [];
}

function migrateCategory(legacy: unknown): CategoryType {
  return LEGACY_CATEGORY_IDS[String(legacy)] ?? CATEGORY_TYPES.OTHERS;
}

function migrateMoney(legacy: unknown): number {
  return toMinorUnits(Number(legacy) || 0);
}

export function migrateTransactionsToV1(persisted: unknown): {
  transactions: Transaction[];
} {
  const transactions = readList(persisted, 'transactions').map((entry) => ({
    id: String(entry.id),
    type: entry.type as TransactionType,
    accountId: DEFAULT_ACCOUNT_ID,
    category: migrateCategory(entry.category),
    amount: migrateMoney(entry.amount),
    date: String(entry.date),
    description: String(entry.description ?? ''),
    createdAt: String(entry.createdAt ?? new Date().toISOString()),
    updatedAt: String(entry.updatedAt ?? new Date().toISOString()),
  }));

  return { transactions };
}

export function migrateBudgetsToV1(persisted: unknown): { budgets: Budget[] } {
  const budgets = readList(persisted, 'budget').map((entry) => ({
    id: String(entry.id),
    category: migrateCategory(entry.category),
    monthlyLimit: migrateMoney(entry.monthlyLimit),
    createdAt: String(entry.createdAt ?? new Date().toISOString()),
    updatedAt: String(entry.updatedAt ?? new Date().toISOString()),
  }));

  return { budgets };
}

const MONEY_PAYMENT_TERMS = [
  'installmentAmount',
  'minimumPayment',
  'statementBalance',
  'suggestedPaymentAmount',
];

export function migrateDebtsToV1(persisted: unknown): { debts: Debt[] } {
  const debts = readList(persisted, 'debts').map((entry) => {
    const terms = { ...((entry.paymentTerms ?? {}) as LegacyRecord) };

    for (const key of MONEY_PAYMENT_TERMS) {
      if (typeof terms[key] === 'number') {
        terms[key] = migrateMoney(terms[key]);
      }
    }

    return {
      ...entry,
      originalAmount: migrateMoney(entry.originalAmount),
      currentBalance: migrateMoney(entry.currentBalance),
      paymentTerms: terms,
    } as unknown as Debt;
  });

  return { debts };
}
