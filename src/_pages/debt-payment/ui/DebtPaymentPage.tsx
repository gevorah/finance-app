'use client';

import { getDebtAccounts, useAccountStore } from '@/entities/account';
import { DebtPaymentForm } from '@/features/debts/debt-payment-form';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { useHydrated } from '@/shared/hooks/useHydrated';
import { ArrowLeft, SearchX } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import './debt-payment.scss';

export function DebtPaymentPage() {
  const hydrated = useHydrated();
  const { accounts } = useAccountStore();
  const { id } = useParams();
  const router = useRouter();

  if (!hydrated) return null;

  const debt = getDebtAccounts(accounts).find((account) => account.id === id);

  if (!debt) {
    return (
      <EmptyState
        icon={<SearchX size={28} />}
        title="Debt not found"
        description="This debt may have been deleted, or the link is incorrect."
        action={
          <Button
            variant="secondary"
            size="small"
            onPress={() => router.push('/debts')}
          >
            <ArrowLeft /> <span>Debts</span>
          </Button>
        }
      />
    );
  }

  return (
    <div className="debt-payment-page">
      <Button
        variant="secondary"
        size="small"
        className="debt-payment-page__back"
        onPress={() => router.back()}
      >
        <ArrowLeft size={16} /> <span>Back</span>
      </Button>
      <section>
        <h1 className="debt-payment-page__title">Register payment</h1>
        <DebtPaymentForm debt={debt} />
      </section>
    </div>
  );
}
