'use client';

import { Button } from '@/shared/components/ui/button';
import { useTransactionStore } from '@/entities/transaction';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import TransactionForm from '../transaction-form/TransactionForm';

export default function EditTransaction() {
  const { transactions } = useTransactionStore();
  const { id } = useParams();
  const router = useRouter();
  const transaction = transactions.find((t) => t.id === id);
  if (!transaction) return <p>Transaction not found.</p>;
  return (
    <main className="update-transaction-container">
      <div className="back-section">
        <Button
          variant={'secondary'}
          size={'small'}
          onPress={() => router.back()}
        >
          <ArrowLeft /> <span>Back</span>
        </Button>
      </div>
      <section>
        <TransactionForm initialData={transaction} />
      </section>
    </main>
  );
}
