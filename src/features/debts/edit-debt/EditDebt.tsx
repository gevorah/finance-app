'use client';

import { Button } from '@/shared/components/ui/button';
import { useDebtStore } from '@/entities/debt';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import DebtForm from '../debt-form/DebtForm';

export default function EditDebt() {
  const { debts } = useDebtStore();
  const { id } = useParams();
  const debtDetail = debts.find((debt) => debt.id === id);
  const router = useRouter();
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
