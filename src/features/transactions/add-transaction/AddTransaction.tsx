'use client';

import './AddTransaction.scss';

import { Button } from '@/shared/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import TransactionForm from '../transaction-form/TransactionForm';

export default function AddTransaction() {
  const router = useRouter();
  return (
    <main className="add-transaction-container">
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
        <TransactionForm></TransactionForm>
      </section>
    </main>
  );
}
