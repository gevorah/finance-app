import { Account, accountSchema, getRealAccounts } from '@/entities/account';

/** The rule needs the other accounts, so it belongs to the form, not the entity. */
export function withUniqueName(accounts: Account[], editingId?: string) {
  return accountSchema.refine(
    (data) =>
      !getRealAccounts(accounts).some(
        (item) =>
          item.id !== editingId &&
          item.name.trim().toLowerCase() === data.name.trim().toLowerCase(),
      ),
    {
      error: 'You already have an account with that name',
      path: ['name'],
    },
  );
}
