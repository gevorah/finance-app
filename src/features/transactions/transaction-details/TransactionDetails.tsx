'use client';

import './TransactionDetails.scss';

import {
  getAccountIcon,
  getAccountName,
  useAccountsById,
  useAccountStore,
} from '@/entities/account';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { formatCurrency } from '@/shared/lib/currency';
import { formatDateLong } from '@/shared/lib/date';
import {
  describeTransaction,
  isEditableKind,
  TRANSACTION_KINDS,
  useTransactionStore,
} from '@/entities/transaction';
import { ArrowLeft, SearchX } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import Link from 'next/link';

export default function TransactionDetails() {
  const { transactions, deleteTransaction } = useTransactionStore();
  const { accounts } = useAccountStore();
  const accountsById = useAccountsById();
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

  const view = describeTransaction(transaction, accountsById);
  const signedAmount =
    view.kind === TRANSACTION_KINDS.INCOME ? view.amount : -view.amount;
  const counterName = getAccountName(accounts, view.counterAccountId);
  const isEditable = isEditableKind(view.kind);

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
            className={`transaction-icon transaction-icon--${view.kind}`}
          >
            {getAccountIcon(accountsById.get(view.counterAccountId), 28)}
          </div>
          <h1 className="details-header__title">{transaction.description}</h1>
          <p className="details-header__category">{counterName}</p>
          <p
            className={`details-header__amount details-header__amount--${view.kind}`}
          >
            {formatCurrency(signedAmount, { showSign: true })}
          </p>
        </div>

        <div className="transaction-information">
          <p className="transaction-information__title"> INFORMATION </p>
          {transaction.payee && (
            <p className="transaction-information__row">
              Payee: {transaction.payee}
            </p>
          )}
          <p className="transaction-information__row">
            Type: {view.kind}
          </p>
          <p className="transaction-information__row">
            Category: {counterName}
          </p>
          <p className="transaction-information__row">
            Date: {formatDateLong(transaction.date)}
          </p>
          <p className="transaction-information__row">
            Account: {getAccountName(accounts, view.accountId)}
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
          icon={getAccountIcon(accountsById.get(view.counterAccountId), 24)}
        >
          <Button variant={'secondary'} size={'medium'} slot="close">
            Cancel
          </Button>
          <Button variant={'primary'} size={'medium'} onPress={handleDelete}>
            Delete
          </Button>
        </Dialog>
        {isEditable && (
          <Link href={`/transactions/${transaction.id}/edit/`} key={transaction.id}>
            <Button variant={'primary'} size={'medium'}>
              Edit
            </Button>
          </Link>
        )}
      </div>
    </main>
  );
}
