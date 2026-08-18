import { ACCOUNT_KINDS, accountSchema } from '@/entities/account';
import { describe, expect, it } from 'vitest';

const existing = [
  { id: 'a', name: 'Bancolombia' },
  { id: 'b', name: 'Cash' },
];

const withUniqueName = (editingId?: string) =>
  accountSchema.refine(
    (data) =>
      !existing.some(
        (item) =>
          item.id !== editingId &&
          item.name.trim().toLowerCase() === data.name.trim().toLowerCase(),
      ),
    { error: 'You already have an account with that name', path: ['name'] },
  );

const values = (name: string) => ({
  name,
  kind: ACCOUNT_KINDS.CHECKING,
  onBudget: true,
});

describe('unique account name', () => {
  it('rejects a name already in use, ignoring case and spacing', () => {
    const result = withUniqueName().safeParse(values('  bancolombia '));

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['name']);
  });

  it('lets an account keep its own name while being edited', () => {
    expect(withUniqueName('a').safeParse(values('Bancolombia')).success).toBe(
      true,
    );
  });

  it('accepts a name nobody else has', () => {
    expect(withUniqueName().safeParse(values('Nequi')).success).toBe(true);
  });
});
