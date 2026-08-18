'use client';

import { getDebtAccounts, useAccountStore } from '@/entities/account';
import { Button } from '@/shared/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import DebtForm from '../debt-form/DebtForm';

export default function EditDebt() {
  const { accounts } = useAccountStore();
  const { id } = useParams();
  const router = useRouter();
  const debtDetail = getDebtAccounts(accounts).find((debt) => debt.id === id);

  return (
    <main className="edit-debt-container">
      <div className="back-section">
        <Button
          variant={'secondary'}
          size={'small'}
          onPress={() => router.back()}
        >
          <ArrowLeft /> <span>Back</span>
        </Button>
      </div>
      <section className="form-container">
        <DebtForm debtInfo={debtDetail} />
      </section>
    </main>
  );
}
