'use client';

import './TransactionDetails.scss';

import { getCategoryIcon, getCategoryLabel } from '@/entities/category';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { formatCurrency } from '@/shared/lib/currency';
import { formatDateLong } from '@/shared/lib/date';
import { useAccountStore } from '@/stores/accountStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { ArrowLeft, SearchX } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import Link from 'next/link';

export default function TransactionDetails() {
  const { transactions, deleteTransaction } = useTransactionStore();
  const { accounts } = useAccountStore();
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

  const categoryLabel = transaction.category
    ? getCategoryLabel(transaction.category)
    : 'Transfer';

  const accountName = (id: string) =>
    accounts.find((account) => account.id === id)?.name ?? 'Unknown account';

  const handleDelete = () => {
    deleteTransaction(transaction.id);
    router.push('/transactions');
  };

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
          <p className="details-header__category">{categoryLabel}</p>
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
            Category: {categoryLabel}
          </p>
          <p className="transaction-information__row">
            Date: {formatDateLong(transaction.date)}
          </p>
          <p className="transaction-information__row">
            Account: {accountName(transaction.accountId)}
          </p>
        </div>
      </section>
      <div className="btns-container">
        <Dialog
          trigger={
            <Button variant={'primary'} size={'medium'}>
              Delete
            </Button>
          }
          title={'Delete Transaction?'}
          description={
            'Are you sure you want to delete this transaction? This action cannot be undone.'
          }
          icon={getCategoryIcon(transaction.category, 24)}
        >
          <Button variant={'secondary'} size={'medium'}>
            Edit
          </Button>
          <Button variant={'primary'} size={'medium'} onClick={handleDelete}>
            Delete
          </Button>
        </Dialog>
        <Link href={`/transactions/${transaction.id}/edit/`} key={transaction.id}>
          <Button variant={'primary'} size={'medium'}>
            Edit
          </Button>
        </Link>
      </div>
    </main>
  );
}
