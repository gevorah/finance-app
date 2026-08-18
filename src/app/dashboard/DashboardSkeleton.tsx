import { TransactionListSkeleton } from '@/features/transactions/transaction-list/TransactionListSkeleton';
import { Skeleton } from '@/shared/components/ui/skeleton';

import './DashboardSkeleton.scss';

export function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton">
      <div className="dashboard-skeleton__balance-row">
        <Skeleton className="dashboard-skeleton__balance" />
        <div className="dashboard-skeleton__metrics">
          <Skeleton className="dashboard-skeleton__metric" />
          <Skeleton className="dashboard-skeleton__metric" />
        </div>
      </div>
      <div className="dashboard-skeleton__charts">
        <Skeleton className="dashboard-skeleton__chart" />
        <Skeleton className="dashboard-skeleton__chart" />
        <Skeleton className="dashboard-skeleton__chart" />
      </div>
      <Skeleton className="dashboard-skeleton__section-title" />
      <TransactionListSkeleton count={5} />
    </div>
  );
}
