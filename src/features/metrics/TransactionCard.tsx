import { ReactNode } from 'react';
import { Card } from '@/shared/components/ui/card';
import "./TransactionCard.scss";

interface TransactionCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  value: string;
  date?: string;
}

export function TransactionCard({
  title,
  description,
  icon,
  value,
  date,
}: TransactionCardProps) {
  return (
    <Card type="tertiary" className="transaction-card">
      <section className="transaction-item">
        <div className="transaction-icon">
            {icon}
        </div>
        <div className='transaction-details'>
            <p className='transaction-details__title'>{title}</p>
            <p className='transaction-details__description'>{description}</p>
        </div>
        <div className='transaction-amount'>
            <p className='transaction-amount__value'>{value}</p>
            <p className='transaction-amount__date'>{date}</p>
        </div>
      </section>
    </Card>
  );
}
