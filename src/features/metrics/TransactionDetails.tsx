'use client';

import './TransactionDetails.scss';

import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { formatCurrency } from '@/shared/lib/currency';
import { formatDateLong } from '@/shared/lib/date';
import { useTransactionStore } from '@/stores/transactionStore';
import { ArrowLeft, SearchX } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { getCategoryIcon } from '../transactions/utils/getCategoryIcon';

export default function TransactionDetails() {
  const { transactions } = useTransactionStore();
  const { id } = useParams();
  const router = useRouter();
  const transaction = transactions.find((t) => t.id === id);

  if (!transaction) {
    return (
      <EmptyState
        icon={<SearchX size={28} />}
        title="Transaction not found"
        description="This transaction may have been deleted, or the link is incorrect."
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

  const signedAmount =
    transaction.type === 'income' ? transaction.amount : -transaction.amount;

  return (
    <main>
      <div className="back-section">
        <Button
          variant={'secondary'}
          size={'small'}
          onPress={() => router.back()}
        >
          <ArrowLeft /> <span>Back</span>
        </Button>
      </div>
      <section className="transaction-details">
        <div className="details-header">
          <div
            className={`transaction-icon transaction-icon--${transaction.type}`}
          >
            {getCategoryIcon(transaction.category, 28)}
          </div>
          <h1 className="details-header__title">{transaction.description}</h1>
          <p className="details-header__category">{transaction.category}</p>
          <p
            className={`details-header__amount details-header__amount--${transaction.type}`}
          >
            {formatCurrency(signedAmount, { showSign: true })}
          </p>
        </div>

        <div className="transaction-information">
          <p className="transaction-information__title"> INFORMATION </p>
          <p className="transaction-information__row">
            Type: {transaction.type}
          </p>
          <p className="transaction-information__row">
            Category: {transaction.category}
          </p>
          <p className="transaction-information__row">
            Date: {formatDateLong(transaction.date)}
          </p>
          <p className="transaction-information__row">Payment:</p>
        </div>
      </section>
      <div className="btns-container">
        <Button variant={'primary'} size={'medium'}>
          Delete
        </Button>
        <Button variant={'primary'} size={'medium'}>
          Edit
        </Button>
      </div>
    </main>
  );
}
