'use client';

import {
  buildProjectionReadiness,
  getAmountOwed,
  getDebtAccounts,
  getTotalDebt,
  useAccountStore,
} from '@/entities/account';
import { useTransactionStore } from '@/entities/transaction';
import { StrategyComparison } from '@/features/debts/strategy-comparison';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useHydrated } from '@/shared/hooks/useHydrated';
import { formatCurrency } from '@/shared/lib/currency';
import { HandCoins, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { DebtCard } from './DebtCard';

import './Debts.scss';

const NEW_DEBT_ROUTE = '/accounts/new?kind=credit_card';

export function DebtsPage() {
  const hydrated = useHydrated();
  const { accounts } = useAccountStore();
  const { transactions } = useTransactionStore();
  const router = useRouter();

  if (!hydrated) {
    return (
      <div className="debts">
        <Skeleton className="debts-overview debts-overview--loading" />
        <Skeleton className="debts-row--loading" />
        <Skeleton className="debts-row--loading" />
      </div>
    );
  }

  const debts = getDebtAccounts(accounts);
  const readiness = buildProjectionReadiness(accounts, transactions);
  const outstanding = debts.filter(
    (account) => getAmountOwed(account, transactions) > 0,
  );
  const paidOff = debts.filter(
    (account) => getAmountOwed(account, transactions) <= 0,
  );

  return (
    <div className="debts">
      <section className="debts-header">
        <h3 className="debts-header__title">Debts</h3>
        <Button
          size="small"
          className="debts-header__button"
          onPress={() => router.push(NEW_DEBT_ROUTE)}
        >
          <Plus size={14} /> Add
        </Button>
      </section>

      {debts.length === 0 ? (
        <EmptyState
          icon={<HandCoins size={28} />}
          title="No debts yet"
          description="Track what you owe and stay on top of your payments. Add your first one."
          action={
            <Button
              variant="primary"
              size="small"
              onPress={() => router.push(NEW_DEBT_ROUTE)}
            >
              Add debt
            </Button>
          }
        />
      ) : (
        <>
          <section className="debts-overview">
            <p className="debts-overview__label">Total owed</p>
            <p className="debts-overview__amount">
              {formatCurrency(getTotalDebt(accounts, transactions))}
            </p>
            <p className="debts-overview__meta">
              {`${outstanding.length} debt${outstanding.length !== 1 ? 's' : ''} still open`}
            </p>
          </section>

          <StrategyComparison readiness={readiness} />

          <section className="debts-group">
            <h4 className="debts-group__title">Your debts</h4>
            <div className="debts-group__items">
              {outstanding.map((debt) => (
                <DebtCard debt={debt} key={debt.id} />
              ))}
              {paidOff.map((debt) => (
                <DebtCard debt={debt} key={debt.id} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
