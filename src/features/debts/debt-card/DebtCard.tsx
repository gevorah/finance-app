'use client';

import { Debt } from '@/entities/debt';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { formatCurrency } from '@/shared/lib/currency';
import { formatDate } from '@/shared/lib/date';
import { useDebtStore } from '@/stores/debtStore';
import { Check, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';

import './DebtCard.scss';

interface DebtCardProps {
  debt: Debt;
}

export function DebtCard({ debt }: DebtCardProps) {
  const { markAsPaid } = useDebtStore();
  const router = useRouter();
  const isPaid = debt.status === 'paid_off';
  const nextPaymentDueDate = debt.paymentTerms.nextPaymentDueDate;

  return (
    <Card className="debt-card">
      <div className="debt-card__info">
        <h4 className="debt-card__name">{debt.creditorName}</h4>
        {debt.description && (
          <p className="debt-card__description">{debt.description}</p>
        )}
        {nextPaymentDueDate && (
          <p className="debt-card__due">Due {formatDate(nextPaymentDueDate)}</p>
        )}
      </div>
      <div className="debt-card__meta">
        <span className="debt-card__amount">
          {formatCurrency(debt.currentBalance)}
        </span>
        <div className="debt-card__actions">
          {isPaid ? (
            <span className="debt-card__badge">Paid</span>
          ) : (
            <Button
              size="small"
              variant="secondary"
              className="debt-card__action"
              onPress={() => markAsPaid(debt.id)}
            >
              <Check size={14} /> Mark as paid
            </Button>
          )}
          <Button
            size="small"
            variant="ghost"
            className="debt-card__edit"
            aria-label="Edit debt"
            onPress={() => router.push(`/debts/${debt.id}/edit`)}
          >
            <Pencil size={14} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
