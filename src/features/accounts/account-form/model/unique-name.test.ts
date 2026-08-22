import {
  Account,
  ACCOUNT_KINDS,
  ACCOUNT_ROOTS,
  isOnBudgetByDefault,
} from '@/entities/account';
import { describe, expect, it } from 'vitest';

import { withUniqueName } from './unique-name';

const account = (id: string, name: string, archived = false) =>
  ({
    id,
    name,
    root: ACCOUNT_ROOTS.ASSETS,
    kind: ACCOUNT_KINDS.CASH,
    onBudget: true,
    archived,
  }) as Account;

const existing = [account('a', 'Bancolombia'), account('b', 'Cash')];

const values = (name: string) => ({
  name,
  kind: ACCOUNT_KINDS.CASH,
  onBudget: isOnBudgetByDefault(ACCOUNT_KINDS.CASH),
});

const accepts = (accounts: Account[], name: string, editingId?: string) =>
  withUniqueName(accounts, editingId).safeParse(values(name)).success;

describe('withUniqueName', () => {
  it('turns down a name another account already holds', () => {
    const result = withUniqueName(existing).safeParse(values('Cash'));

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['name']);
  });

  it('ignores case and surrounding spaces', () => {
    expect(accepts(existing, '  cash ')).toBe(false);
  });

  it('lets an account keep its own name while editing', () => {
    expect(accepts(existing, 'Cash', 'b')).toBe(true);
  });

  it('frees the name of an account that was closed', () => {
    expect(accepts([account('a', 'Bancolombia', true)], 'Bancolombia')).toBe(
      true,
    );
  });

  it('accepts a name nobody is using', () => {
    expect(accepts(existing, 'Nequi')).toBe(true);
  });
});
