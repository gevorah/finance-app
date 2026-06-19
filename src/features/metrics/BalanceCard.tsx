import { TransactionType } from '@/entities/transaction';

import './BalanceCard.scss';

import { Card } from '@/shared/components/ui/card';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface CardBalanceProps {
  balance: number;
  stats?: Stats[];
}

interface Stats {
  icon: TransactionType;
  label: string;
  value: number;
}

export function BalanceCard({ balance, stats = [] }: CardBalanceProps) {
  return (
    <Card type="primary" className="balance-card">
      <div className="balance-header">
        <p className="balance-header__title">total balance</p>
        <p className="balance-header__description">${balance}</p>
      </div>
      <section className="stats">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-item`}>
            <div className={`stat-item__icon stat-item__icon--${stat.icon}`}>
              {stat.icon === 'income' ? (
                <ArrowUp size={16} />
              ) : (
                <ArrowDown size={16} />
              )}
            </div>
            <div>
              <p className={`stat-item__label`}>{stat.label}</p>
              <p className={`stat-item__value stat-item__value--${stat.icon}`}>
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </section>
    </Card>
  );
}
