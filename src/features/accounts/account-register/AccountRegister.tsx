'use client';

import {
  Account,
  ACCOUNT_ROOTS,
  getAccountBalance,
  useAccountsById,
  useAccountStore,
} from '@/entities/account';
import {
  getAccountRegister,
  RegisterRow,
  useTransactionStore,
} from '@/entities/transaction';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { useHydrated } from '@/shared/hooks/useHydrated';
import { formatCurrency } from '@/shared/lib/currency';
import { formatDate } from '@/shared/lib/date';
import { ArrowLeft, Receipt, SearchX } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { ordinal } from '../lib/ordinal';

import './AccountRegister.scss';

interface HeaderFigure {
  label: string;
  value: string;
}

function getHeader(
  account: Account,
  balance: number,
): { label: string; amount: string; figures: HeaderFigure[] } {
  if (account.root !== ACCOUNT_ROOTS.LIABILITIES) {
    return {
      label: `${account.name} · balance`,
      amount: formatCurrency(balance),
      figures: [],
    };
  }

  const owed = -balance;
  const figures: HeaderFigure[] = [];

  if (account.creditLimit !== undefined) {
    figures.push({
      label: 'Available credit',
      value: formatCurrency(account.creditLimit - owed),
    });
  }
  if (account.paymentDueDay !== undefined) {
    figures.push({
      label: 'Payment due',
      value: `the ${ordinal(account.paymentDueDay)}`,
    });
  }

  return {
    label: `${account.name} · owed`,
    amount: formatCurrency(owed),
    figures,
  };
}

function RegisterLine({
  row,
  counterName,
}: {
  row: RegisterRow;
  counterName: string;
}) {
  const { transaction, delta, runningBalance } = row;

  return (
    <div className="register-row">
      <div className="register-row__main">
        <p className="register-row__description">{transaction.description}</p>
        <p className="register-row__counter">
          {counterName} · {formatDate(transaction.date)}
        </p>
      </div>
      <div className="register-row__amounts">
        <p
          className={`register-row__delta register-row__delta--${
            delta < 0 ? 'out' : 'in'
          }`}
        >
          {formatCurrency(delta, { showSign: true })}
        </p>
        <p className="register-row__running">
          {formatCurrency(runningBalance)}
        </p>
      </div>
    </div>
  );
}

export default function AccountRegister() {
  const hydrated = useHydrated();
  const { accounts } = useAccountStore();
  const { transactions } = useTransactionStore();
  const accountsById = useAccountsById();
  const { id } = useParams();
  const router = useRouter();

  const account = accounts.find((item) => item.id === id);

  if (!hydrated) return null;

  if (!account) {
    return (
      <EmptyState
        icon={<SearchX size={28} />}
        title="Account not found"
        description="This account may have been deleted, or the link is incorrect."
        action={
          <Button
            variant="secondary"
            size="small"
            onPress={() => router.back()}
          >
            <ArrowLeft /> <span>Back</span>
          </Button>
        }
      />
    );
  }

  const rows = getAccountRegister(transactions, account.id);
  const header = getHeader(account, getAccountBalance(account, transactions));

  const nameFor = (row: RegisterRow) =>
    row.isSplit
      ? `Split · ${row.counterAccountIds.length} accounts`
      : (accountsById.get(row.counterAccountIds[0])?.name ?? 'Unknown');

  return (
    <div className="account-register">
      <Button
        variant="secondary"
        size="small"
        className="account-register__back"
        onPress={() => router.push('/accounts')}
      >
        <ArrowLeft size={16} /> <span>Accounts</span>
      </Button>

      <section className="account-register__header">
        <p className="account-register__label">{header.label}</p>
        <p className="account-register__amount">{header.amount}</p>
        {header.figures.length > 0 && (
          <div className="account-register__figures">
            {header.figures.map((figure) => (
              <div key={figure.label}>
                <p className="account-register__figure-label">{figure.label}</p>
                <p className="account-register__figure-value">{figure.value}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="account-register__section">
        <h3 className="account-register__title">Movements</h3>
        <Button
          variant="secondary"
          size="small"
          onPress={() => router.push(`/accounts/${account.id}/edit`)}
        >
          Edit
        </Button>
      </section>

      {rows.length === 0 ? (
        <EmptyState
          icon={<Receipt size={28} />}
          title="Nothing registered yet"
          description="Movements that touch this account will show up here with a running balance."
        />
      ) : (
        <Card className="account-register__rows">
          {rows.map((row) => (
            <RegisterLine
              key={row.transaction.id}
              row={row}
              counterName={nameFor(row)}
            />
          ))}
        </Card>
      )}
    </div>
  );
}
