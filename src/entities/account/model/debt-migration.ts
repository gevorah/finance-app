import { PersistedRecord, readPersistedList } from '@/shared/lib/persist';

import { DebtTerms } from './debt-terms';
import { Account, ACCOUNT_KINDS, ACCOUNT_ROOTS } from './types';

/**
 * Debts used to be their own entity with a stored currentBalance. Each one
 * becomes a liability account, and what it owed becomes an opening balance so
 * the number lives in the ledger like every other balance.
 */

const LEGACY_TYPE_TO_KIND: Record<string, string> = {
  credit_card: ACCOUNT_KINDS.CREDIT_CARD,
  loan: ACCOUNT_KINDS.LOAN,
  mortgage: ACCOUNT_KINDS.MORTGAGE,
  vehicle: ACCOUNT_KINDS.VEHICLE,
  student: ACCOUNT_KINDS.STUDENT,
  personal: ACCOUNT_KINDS.PERSONAL,
};

export const legacyDebtAccountId = (debtId: string) => `liabilities-${debtId}`;

export interface LegacyDebt {
  accountId: string;
  amountOwed: number;
  startDate: string;
}

export function readLegacyDebts(persisted: unknown): PersistedRecord[] {
  const state = (persisted as { state?: unknown } | undefined)?.state;
  return readPersistedList(state ?? persisted, 'debts');
}

export function legacyDebtsToAccounts(persisted: unknown): Account[] {
  return readLegacyDebts(persisted).map((entry) => {
    const now = new Date().toISOString();
    const terms = entry.paymentTerms as PersistedRecord | undefined;

    return {
      id: legacyDebtAccountId(String(entry.id)),
      name: String(entry.creditorName ?? 'Debt'),
      root: ACCOUNT_ROOTS.LIABILITIES,
      kind: LEGACY_TYPE_TO_KIND[String(entry.type)] ?? ACCOUNT_KINDS.PERSONAL,
      onBudget: true,
      description: entry.description ? String(entry.description) : undefined,
      cutOffDay:
        typeof terms?.cutOffDay === 'number' ? terms.cutOffDay : undefined,
      debtTerms: {
        interest: entry.interest,
        paymentTerms: terms,
      } as unknown as DebtTerms,
      archived: false,
      createdAt: String(entry.createdAt ?? now),
      updatedAt: String(entry.updatedAt ?? now),
    } as Account;
  });
}

export function legacyDebtsToOpeningBalances(persisted: unknown): LegacyDebt[] {
  return readLegacyDebts(persisted)
    .filter((entry) => Number(entry.currentBalance) > 0)
    .map((entry) => ({
      accountId: legacyDebtAccountId(String(entry.id)),
      amountOwed: Number(entry.currentBalance),
      startDate: String(entry.startDate ?? '').slice(0, 10),
    }));
}

const LEGACY_DEBT_STORAGE_KEY = 'debt-storage';

export function readLegacyDebtStorage(): unknown {
  if (typeof localStorage === 'undefined') return undefined;

  try {
    const raw = localStorage.getItem(LEGACY_DEBT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}
