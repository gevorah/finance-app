'use client';

import { Debt } from '@/entities/debt';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { useDebtStore } from '@/stores/debtStore';
import { HandCoins, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { DebtCard } from './debt-card/DebtCard';

import './Debts.scss';

const byPriorityThenDueDate = (a: Debt, b: Debt) => {
  const priorityA = a.priority ?? Number.MAX_SAFE_INTEGER;
  const priorityB = b.priority ?? Number.MAX_SAFE_INTEGER;

  if (priorityA !== priorityB) {
    return priorityA - priorityB;
  }

  const dueA = a.paymentTerms.nextPaymentDueDate ?? '';
  const dueB = b.paymentTerms.nextPaymentDueDate ?? '';

  return dueA.localeCompare(dueB);
};

export default function Debts() {
  const { debts } = useDebtStore();
  const router = useRouter();

  const sortedDebts = [...debts].sort(byPriorityThenDueDate);

  return (
    <div className="debts">
      <section className="debts-header">
        <h3 className="debts-header__title">Debts</h3>
        <Button
          size="small"
          className="debts-header__button"
          onPress={() => router.push('/debts/new')}
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
              onPress={() => router.push('/debts/new')}
            >
              Add debt
            </Button>
          }
        />
      ) : (
        <div className="debts-group__items">
          {sortedDebts.map((debt) => (
            <DebtCard debt={debt} key={debt.id} />
          ))}
        </div>
      )}
    </div>
  );
}
