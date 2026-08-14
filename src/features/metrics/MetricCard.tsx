import { TransactionType } from '@/entities/transaction';
import { formatCurrency } from '@/shared/lib/currency';
import { Money } from '@/shared/lib/money';

import './MetricCard.scss';

import { Card } from '@/shared/components/ui/card';
import { ArrowDown, ArrowDownLeft, ArrowUp } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: Money;
  icon: TransactionType;
  trend?: string;
}

export function MetricCard({ title, value, icon, trend }: MetricCardProps) {
  return (
    <Card type="secondary" className="metric-card">
      <div className={`metric-header metric-header--${icon}`}>
        {icon === 'income' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
      </div>
      <section className="metric-information">
        <p className="metric-information__title">{title}</p>
        <p className="metric-information__value">{formatCurrency(value)}</p>
        <p
          className={`metric-information__trend metric-information__trend--${icon}`}
        >
          {icon === 'income' ? (
            <ArrowUp size={12} />
          ) : (
            <ArrowDownLeft size={12} />
          )}
          {trend}
        </p>
      </section>
    </Card>
  );
}
