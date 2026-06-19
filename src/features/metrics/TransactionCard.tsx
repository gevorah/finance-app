import { Card } from '@/shared/components/ui/card';

import './TransactionCard.scss';

import { Transaction } from '@/entities/transaction';
import { formatCurrency } from '@/shared/lib/currency';
import { formatDate } from '@/shared/lib/date';

import { getCategoryIcon } from '../transactions/utils/getCategoryIcon';

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const signedAmount =
    transaction.type === 'income' ? transaction.amount : -transaction.amount;

  return (
    <Card type="tertiary" className="transaction-card">
      <section className="transaction-item">
        <div
          className={`transaction-icon transaction-icon--${transaction.type}`}
        >
          {getCategoryIcon(transaction.category)}
        </div>
        <div className="transaction-details">
          <p className="transaction-details__title">
            {transaction.description}
          </p>
          <p className="transaction-details__description">
            {transaction.category}
          </p>
        </div>
        <div className="transaction-amount">
          <p
            className={`transaction-amount__value transaction-amount__value--${transaction.type}`}
          >
            {formatCurrency(signedAmount, { showSign: true })}
          </p>
          <p className="transaction-amount__date">
            {formatDate(transaction.date)}
          </p>
        </div>
      </section>
    </Card>
  );
}
