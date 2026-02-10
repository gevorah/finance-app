import { TransactionType, VariantType } from '@/features/transactions';
import './card.scss';
import { ArrowUp } from '../icon/ArrowUp';
import { ArrowDown } from '../icon/ArrowDown';

interface CardProps {
  title: string;
  description?: string;
  type: VariantType;
  size?: 'sm' | 'md' | 'lg';
  badge?: string;
  stats?: Stats[];
}

interface Stats {
  icon: TransactionType;
  label: string;
  value: string;
}

export function Card({
  title,
  description,
  type,
  size,
  stats,
  badge,
}: CardProps) {
  const cardStyle = `container ${type}`;
  //const hasSubdescription = `${subDescription ? 'secondary-info' : ''}`;
  return (
    <section className={`container ${cardStyle}`}>
      <p className={`container__title`}>{title}</p>
      <p className={`container__description`}>{description}</p>
      {stats && stats.length > 0 && (
        <div className={`container__stats`}>
          {stats.map((stat, index) => (
            <div key={index} className={`container__stat-item`}>
              <div className={`container__icon container__icon--${stat.icon}`}>
                {stat.icon === 'income' ? <ArrowUp /> : <ArrowDown />}
              </div>
              <div className='stats-container'>
                <p className={'stats-container__label'}>{stat.label}</p>
                <p className={`stats-container__value stats-container__value--${stat.icon}`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
