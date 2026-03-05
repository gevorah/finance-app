import { Card } from '@/shared/components/ui/card';
import "./TransactionCard.scss";
import { Transaction } from '../transactions';

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({
transaction
}: TransactionCardProps) {
  return (
    <Card type="tertiary" className="transaction-card">
      <section className="transaction-item">
        <div className="transaction-icon">
            {transaction.icon}
        </div>
        <div className='transaction-details'>
            <p className='transaction-details__title'>{transaction.title}</p>
            <p className='transaction-details__description'>{transaction.description}</p>
        </div>
        <div className='transaction-amount'>
            <p className='transaction-amount__value'>{transaction.amount}</p>
            <p className='transaction-amount__date'>{transaction.date}</p>
        </div>
      </section>
    </Card>
  );
}
