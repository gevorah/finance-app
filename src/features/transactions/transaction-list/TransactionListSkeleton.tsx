import { Skeleton } from '@/shared/components/ui/skeleton';

import './TransactionListSkeleton.scss';

interface TransactionListSkeletonProps {
  count?: number;
}

export function TransactionListSkeleton({
  count = 5,
}: TransactionListSkeletonProps) {
  return (
    <section className="transaction-list-skeleton">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="transaction-card-skeleton">
          <Skeleton className="transaction-card-skeleton__icon" />
          <div className="transaction-card-skeleton__details">
            <Skeleton className="transaction-card-skeleton__title" />
            <Skeleton className="transaction-card-skeleton__subtitle" />
          </div>
          <div className="transaction-card-skeleton__amount">
            <Skeleton className="transaction-card-skeleton__value" />
            <Skeleton className="transaction-card-skeleton__date" />
          </div>
        </div>
      ))}
    </section>
  );
}
