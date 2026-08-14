import { Card } from '@/shared/components/ui/card';

import './TransactionCard.scss';

import { getCategoryIcon, getCategoryLabel } from '@/entities/category';
import { Transaction } from '@/entities/transaction';
import { formatCurrency } from '@/shared/lib/currency';
import { formatDate } from '@/shared/lib/date';


interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const isTransfer = transaction.type === 'transfer';
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
            {transaction.category ? getCategoryLabel(transaction.category) : 'Transfer'}
          </p>
        </div>
        <div className="transaction-amount">
          <p
            className={`transaction-amount__value transaction-amount__value--${transaction.type}`}
          >
            {isTransfer
              ? formatCurrency(transaction.amount)
              : formatCurrency(signedAmount, { showSign: true })}
          </p>
          <p className="transaction-amount__date">
            {formatDate(transaction.date)}
          </p>
        </div>
      </section>
    </Card>
  );
}
