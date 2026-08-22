'use client';

import { isRealAccount, useAccountStore } from '@/entities/account';
import { AccountForm } from '@/features/accounts/account-form';
import { CloseAccount } from '@/features/accounts/close-account';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { useHydrated } from '@/shared/hooks/useHydrated';
import { ArrowLeft, SearchX } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { AccountPageShell } from './AccountPageShell';

export function EditAccountPage() {
  const hydrated = useHydrated();
  const { accounts } = useAccountStore();
  const { id } = useParams();
  const router = useRouter();

  if (!hydrated) return null;

  const account = accounts.find((item) => item.id === id);

  if (!account || !isRealAccount(account)) {
    return (
      <EmptyState
        icon={<SearchX size={28} />}
        title="Account not found"
        description="This account may have been deleted, or the link is incorrect."
        action={
          <Button
            variant="secondary"
            size="small"
            onPress={() => router.push('/accounts')}
          >
            <ArrowLeft /> <span>Accounts</span>
          </Button>
        }
      />
    );
  }

  return (
    <AccountPageShell
      title="Edit account"
      footer={<CloseAccount account={account} />}
    >
      <AccountForm account={account} />
    </AccountPageShell>
  );
}
