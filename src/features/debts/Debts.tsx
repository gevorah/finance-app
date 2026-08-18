'use client';

import {
  DEBT_STRATEGIES,
  DebtStrategy,
  getDebtAccounts,
  orderDebtsByStrategy,
  useAccountStore,
} from '@/entities/account';
import { useTransactionStore } from '@/entities/transaction';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Toggle, ToggleButtonGroup } from '@/shared/components/ui/toggle';
import { HandCoins, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { DebtCard } from './debt-card/DebtCard';

import './Debts.scss';

const STRATEGY_HINTS: Record<DebtStrategy, string> = {
  snowball: 'Smallest balance first — quicker wins.',
  avalanche: 'Highest interest first — cheaper overall.',
};

export default function Debts() {
  const { accounts } = useAccountStore();
  const { transactions } = useTransactionStore();
  const router = useRouter();
  const [strategy, setStrategy] = useState<DebtStrategy>(
    DEBT_STRATEGIES.SNOWBALL,
  );

  const debts = getDebtAccounts(accounts);
  const ordered = orderDebtsByStrategy(accounts, transactions, strategy);
  const paidOff = debts.filter(
    (account) => !ordered.some((item) => item.id === account.id),
  );

  return (
    <div className="debts">
      <section className="debts-header">
        <h3 className="debts-header__title">Debts</h3>
        <Button
          size="small"
          className="debts-header__button"
          onPress={() => router.push('/accounts/new?kind=credit_card')}
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
              onPress={() => router.push('/accounts/new?kind=credit_card')}
            >
              Add debt
            </Button>
          }
        />
      ) : (
        <>
          <section className="debts-strategy">
            <ToggleButtonGroup
              className="debts-strategy__toggle"
              selectedKeys={new Set([strategy])}
              onSelectionChange={(keys) => {
                const selected = [...keys][0] as DebtStrategy;
                if (selected) setStrategy(selected);
              }}
            >
              <Toggle id={DEBT_STRATEGIES.SNOWBALL}>Snowball</Toggle>
              <Toggle id={DEBT_STRATEGIES.AVALANCHE}>Avalanche</Toggle>
            </ToggleButtonGroup>
            <p className="debts-strategy__hint">{STRATEGY_HINTS[strategy]}</p>
          </section>

          <div className="debts-group__items">
            {ordered.map((debt) => (
              <DebtCard debt={debt} key={debt.id} />
            ))}
            {paidOff.map((debt) => (
              <DebtCard debt={debt} key={debt.id} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
