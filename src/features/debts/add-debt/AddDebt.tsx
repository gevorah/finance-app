'use client';

import { Button } from '@/shared/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import DebtForm from '../debt-form/DebtForm';

export default function AddDebt() {
  const router = useRouter();
  return (
    <main className="add-debt-container">
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
        <DebtForm />
      </section>
    </main>
  );
}
