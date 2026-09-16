'use client';

import {
  Account,
  getAmountOwed,
  getDebtStatus,
  getMonthlyInterestRate,
  getMonthlyPayment,
} from '@/entities/account';
import { useTransactionStore } from '@/entities/transaction';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { formatCurrency } from '@/shared/lib/currency';
import { formatDate } from '@/shared/lib/date';
import { Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';

import './DebtCard.scss';

interface DebtCardProps {
  debt: Account;
}

export function DebtCard({ debt }: DebtCardProps) {
  const { transactions } = useTransactionStore();
  const router = useRouter();

  const status = getDebtStatus(debt, transactions);
  const amountOwed = getAmountOwed(debt, transactions);
  const nextPaymentDueDate = debt.debtTerms?.paymentTerms.nextPaymentDueDate;
  const monthlyPayment = getMonthlyPayment(debt);

  /** Undeclared interest is unknown, not zero, so it says nothing at all. */
  const interest = debt.debtTerms?.interest;
  const rateLabel = !interest
    ? undefined
    : interest.type === 'none'
      ? 'No interest'
      : `${getMonthlyInterestRate(debt).toFixed(2)}% monthly`;

  return (
    <Card className="debt-card">
      <div className="debt-card__info">
        <h5 className="debt-card__name">{debt.name}</h5>
        {debt.description && (
          <p className="debt-card__description">{debt.description}</p>
        )}
        {(rateLabel || monthlyPayment) && (
          <p className="debt-card__terms">
            {rateLabel}
            {rateLabel && monthlyPayment && <span aria-hidden="true"> · </span>}
            {monthlyPayment && `${formatCurrency(monthlyPayment)} a month`}
          </p>
        )}
        {nextPaymentDueDate && status !== 'paid_off' && (
          <p className="debt-card__due">Due {formatDate(nextPaymentDueDate)}</p>
        )}
      </div>
      <div className="debt-card__meta">
        <span className="debt-card__amount">
          {formatCurrency(Math.max(amountOwed, 0))}
        </span>
        <div className="debt-card__actions">
          {status === 'paid_off' && (
            <span className="debt-card__badge">Paid</span>
          )}
          {status === 'late' && <span className="debt-card__badge">Late</span>}
          <Button
            size="small"
            variant="ghost"
            className="debt-card__edit"
            aria-label="Edit debt"
            onPress={() => router.push(`/accounts/${debt.id}/edit`)}
          >
            <Pencil size={14} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
