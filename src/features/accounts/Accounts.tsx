'use client';

import {
  Account,
  getOnBudgetBalance,
  getRealAccounts,
  getTotalBalance,
  getTotalDebt,
  useAccountStore,
} from '@/entities/account';
import { Transaction, useTransactionStore } from '@/entities/transaction';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useHydrated } from '@/shared/hooks/useHydrated';
import { formatCurrency } from '@/shared/lib/currency';
import { Wallet } from 'lucide-react';

import { AccountCard } from './account-card/AccountCard';

import './Accounts.scss';

const SET_ASIDE_NOTE =
  'Money you are not planning to spend this month. It does not count towards what is available.';

interface AccountGroupProps {
  title: string;
  description?: string;
  accounts: Account[];
  transactions: Transaction[];
}

function AccountGroup({
  title,
  description,
  accounts,
  transactions,
}: AccountGroupProps) {
  return (
    <section className="accounts-group">
      <h4 className="accounts-group__title">{title}</h4>
      {description && <p className="accounts-group__note">{description}</p>}
      <div className="accounts-group__items">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            transactions={transactions}
          />
        ))}
      </div>
    </section>
  );
}

export default function Accounts() {
  const hydrated = useHydrated();
  const { accounts } = useAccountStore();
  const { transactions } = useTransactionStore();

  if (!hydrated) {
    return (
      <div className="accounts">
        <Skeleton className="accounts-total accounts-total--loading" />
        <Skeleton className="accounts-row--loading" />
        <Skeleton className="accounts-row--loading" />
      </div>
    );
  }

  const realAccounts = getRealAccounts(accounts);
  const inBudget = realAccounts.filter((account) => account.onBudget);
  const setAside = realAccounts.filter((account) => !account.onBudget);

  const available = getOnBudgetBalance(accounts, transactions);
  const setAsideTotal = getTotalBalance(accounts, transactions) - available;
  const owed = getTotalDebt(accounts, transactions);

  return (
    <div className="accounts">
      <section className="accounts-total">
        <p className="accounts-total__label">Available</p>
        <p className="accounts-total__amount">{formatCurrency(available)}</p>
        <div className="accounts-total__split">
          <div className="accounts-total__item">
            <p className="accounts-total__item-label">Set aside</p>
            <p className="accounts-total__item-value">
              {formatCurrency(setAsideTotal)}
            </p>
          </div>
          <div className="accounts-total__item">
            <p className="accounts-total__item-label">Owed</p>
            <p className="accounts-total__item-value">{formatCurrency(owed)}</p>
          </div>
        </div>
      </section>

      <h3 className="accounts__title">Your accounts</h3>

      {realAccounts.length === 0 ? (
        <EmptyState
          icon={<Wallet size={28} />}
          title="No accounts yet"
          description="Add the accounts and cards you actually use, and your balance will follow from what you register."
        />
      ) : (
        <>
          {inBudget.length > 0 && (
            <AccountGroup
              title="In the budget"
              accounts={inBudget}
              transactions={transactions}
            />
          )}
          {setAside.length > 0 && (
            <AccountGroup
              title="Set aside"
              description={SET_ASIDE_NOTE}
              accounts={setAside}
              transactions={transactions}
            />
          )}
        </>
      )}
    </div>
  );
}
