'use client';

import { isRealAccount, useAccountStore } from '@/entities/account';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { useHydrated } from '@/shared/hooks/useHydrated';
import { ArrowLeft, SearchX } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import AccountForm from '../account-form/AccountForm';

export default function EditAccount() {
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
    <main>
      <div className="back-section">
        <Button variant="secondary" size="small" onPress={() => router.back()}>
          <ArrowLeft /> <span>Back</span>
        </Button>
      </div>
      <AccountForm account={account} />
    </main>
  );
}
