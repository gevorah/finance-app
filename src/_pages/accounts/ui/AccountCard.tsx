'use client';

import {
  Account,
  ACCOUNT_KIND_LABELS,
  getAccountBalance,
  getAccountIcon,
} from '@/entities/account';
import { Transaction } from '@/entities/transaction';
import { Card } from '@/shared/components/ui/card';
import { formatCurrency } from '@/shared/lib/currency';
import { ordinal } from '@/shared/lib/ordinal';
import Link from 'next/link';

import './AccountCard.scss';

interface AccountCardProps {
  account: Account;
  transactions: Transaction[];
}

function describeAccount(account: Account): string {
  return [
    account.kind && ACCOUNT_KIND_LABELS[account.kind],
    account.cutOffDay && `closes on the ${ordinal(account.cutOffDay)}`,
    account.creditLimit &&
      `${formatCurrency(account.creditLimit, { maximumFractionDigits: 0, minimumFractionDigits: 0 })} limit`,
  ]
    .filter(Boolean)
    .join(' · ');
}

export function AccountCard({ account, transactions }: AccountCardProps) {
  const balance = getAccountBalance(account, transactions);
  const meta = describeAccount(account);

  return (
    <Link href={`/accounts/${account.id}`} className="account-card__link">
      <Card type="tertiary" className="account-card">
        <div className="account-card__icon">{getAccountIcon(account, 18)}</div>
        <div className="account-card__info">
          <p className="account-card__name">{account.name}</p>
          {meta && <p className="account-card__meta">{meta}</p>}
        </div>
        <p
          className={`account-card__amount ${
            balance < 0 ? 'account-card__amount--negative' : ''
          }`}
        >
          {formatCurrency(balance)}
        </p>
      </Card>
    </Link>
  );
}
