'use client';

import { useAccountsById } from '@/entities/account';
import {
  describeTransaction,
  isEditableKind,
  useTransactionStore,
} from '@/entities/transaction';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { ArrowLeft, Lock } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import TransactionForm from '../transaction-form/TransactionForm';

export default function EditTransaction() {
  const { transactions } = useTransactionStore();
  const accountsById = useAccountsById();
  const { id } = useParams();
  const router = useRouter();
  const transaction = transactions.find((t) => t.id === id);
  if (!transaction) return <p>Transaction not found.</p>;

  if (!isEditableKind(describeTransaction(transaction, accountsById).kind)) {
    return (
      <EmptyState
        icon={<Lock size={28} />}
        title="This one cannot be edited here"
        description="An opening balance records what the account already held. It is not an expense, an income or a transfer, so this form cannot represent it."
        action={
          <Button
            variant="secondary"
            size="small"
            onPress={() => router.back()}
          >
            <ArrowLeft /> <span>Back</span>
          </Button>
        }
      />
    );
  }

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
