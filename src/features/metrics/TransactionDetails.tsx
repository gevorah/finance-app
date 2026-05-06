'use client';

import './TransactionDetails.scss';

import { Button } from '@/shared/components/ui/button';
import { useTransactionStore } from '@/stores/transactionStore';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { getCategoryIcon } from '../transactions/utils/getCategoryIcon';

export default function TransactionDetails() {
  const { transactions } = useTransactionStore();
  const { id } = useParams();
  const router = useRouter();
  const transaction = transactions.find((t) => t.id === id);
  if (!transaction) return <p>Transaction not found.</p>;

  return (
    <main>
      <div className="back-section">
        <Button variant={'secondary'} size={'small'} onPress={() => router.back()}>
          <ArrowLeft /> <span>Back</span>
        </Button>
      </div>
      <section className="transaction-details">
        <div className="details-header">
          <div className="transaction-icon">
            {getCategoryIcon(transaction.category, 28)}
          </div>
          <h1 className='details-header__title'>{transaction.description}</h1>
          <p className='details-header__category'>{transaction.category}</p>
          <p className='details-header__amount'>${transaction.amount}</p>
        </div>

        <div className="transaction-information">
          <p className='transaction-information__title'> INFORMATION </p>
          <p className='transaction-information__row'>Type: {transaction.type}</p>
          <p className='transaction-information__row'>Category: {transaction.category}</p>
          <p className='transaction-information__row'>Date: {transaction.date.toString()}</p>
          <p className='transaction-information__row'>Payment:</p>
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
