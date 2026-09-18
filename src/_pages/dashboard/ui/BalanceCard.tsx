import { formatCurrency } from '@/shared/lib/currency';
import { Money } from '@/shared/lib/money';

import './BalanceCard.scss';

import { Card } from '@/shared/components/ui/card';

interface CardBalanceProps {
  balance: Money;
  stats?: Stats[];
}

interface Stats {
  label: string;
  value: Money;
}

export function BalanceCard({ balance, stats = [] }: CardBalanceProps) {
  return (
    <Card type="primary" className="balance-card">
      <header className="balance-card__header">
        <p className="balance-card__title">Available this month</p>
        <p className="balance-card__amount">{formatCurrency(balance)}</p>
        <p className="balance-card__description">
          Money in accounts you are using this month.
        </p>
      </header>
      <section className="stats">
        {stats.map((stat, index) => (
          <div key={index} className="stat-item">
            <p className="stat-item__label">{stat.label}</p>
            <p className="stat-item__value">{formatCurrency(stat.value)}</p>
          </div>
        ))}
      </section>
    </Card>
  );
}
