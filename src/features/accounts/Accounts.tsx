'use client';

import {
  Account,
  getAvailableBalance,
  getDueNowBalance,
  getLongTermBalance,
  getRealAccounts,
  getSetAsideBalance,
  isRealAccount,
  useAccountStore,
} from '@/entities/account';
import { Transaction, useTransactionStore } from '@/entities/transaction';
import { Button } from '@/shared/components/ui/button';
import { Disclosure } from '@/shared/components/ui/disclosure';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useHydrated } from '@/shared/hooks/useHydrated';
import { formatCurrency } from '@/shared/lib/currency';
import { Plus, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { AccountCard } from './account-card/AccountCard';

import './Accounts.scss';

const OUT_OF_BUDGET_NOTE =
  'Savings you decided not to touch, and debt that is not settled this year. Neither counts towards what is available.';

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
  const router = useRouter();

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
  const closed = accounts.filter(
    (account) => isRealAccount(account) && account.archived,
  );

  const figures = [
    { label: 'Set aside', value: getSetAsideBalance(accounts, transactions) },
    { label: 'Due now', value: getDueNowBalance(accounts, transactions) },
    { label: 'Long term', value: getLongTermBalance(accounts, transactions) },
  ];

  const available = getAvailableBalance(accounts, transactions);

  return (
    <div className="accounts">
      <section className="accounts-total">
        <p className="accounts-total__label">Available</p>
        <p className="accounts-total__amount">{formatCurrency(available)}</p>
        <div className="accounts-total__split">
          {figures.map((figure) => (
            <div className="accounts-total__item" key={figure.label}>
              <p className="accounts-total__item-label">{figure.label}</p>
              <p className="accounts-total__item-value">
                {formatCurrency(figure.value)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="accounts__header">
        <h3 className="accounts__title">Your accounts</h3>
        <Button
          size="small"
          className="accounts__add"
          onPress={() => router.push('/accounts/new')}
        >
          <Plus size={14} /> Add
        </Button>
      </section>

      {realAccounts.length === 0 ? (
        <EmptyState
          icon={<Wallet size={28} />}
          title="No accounts yet"
          description="Add the accounts and cards you actually use, and your balance will follow from what you register."
          action={
            <Button
              variant="primary"
              size="small"
              onPress={() => router.push('/accounts/new')}
            >
              Add account
            </Button>
          }
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
              title="Out of the budget"
              description={OUT_OF_BUDGET_NOTE}
              accounts={setAside}
              transactions={transactions}
            />
          )}
        </>
      )}

      {closed.length > 0 && (
        <Disclosure
          title="Closed accounts"
          description="Their movements still count towards past balances."
        >
          <div className="accounts-group__items">
            {closed.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                transactions={transactions}
              />
            ))}
          </div>
        </Disclosure>
      )}
    </div>
  );
}
