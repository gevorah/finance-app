import { Card } from '@/shared/components/ui/card';
import { ArrowDown } from '@/shared/components/ui/icon/ArrowDown';
import { ArrowUp } from '@/shared/components/ui/icon/ArrowUp';

import './BalanceCard.scss';

import { TransactionType } from '../transactions';

interface CardBalanceProps {
  balance: string;
  stats?: Stats[];
}

interface Stats {
  icon: TransactionType;
  label: string;
  value: string;
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
              {stat.icon === 'income' ? <ArrowUp /> : <ArrowDown />}
            </div>
            <div>
              <p className={`stat-item__label`}>
                {stat.label}
              </p>
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
