import {
  getAccountIcon,
  getAccountName,
  useAccountsById,
  useAccountStore,
} from '@/entities/account';
import {
  describeTransaction,
  Transaction,
  TRANSACTION_KINDS,
} from '@/entities/transaction';
import { Card } from '@/shared/components/ui/card';
import { formatCurrency } from '@/shared/lib/currency';
import { formatDate } from '@/shared/lib/date';

import './TransactionCard.scss';

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const { accounts } = useAccountStore();
  const accountsById = useAccountsById();
  const view = describeTransaction(transaction, accountsById);

  const isIncome = view.kind === TRANSACTION_KINDS.INCOME;
  const isTransfer = view.kind === TRANSACTION_KINDS.TRANSFER;
  const signedAmount = isIncome ? view.amount : -view.amount;

  return (
    <Card type="tertiary" className="transaction-card">
      <section className="transaction-item">
        <div className={`transaction-icon transaction-icon--${view.kind}`}>
          {getAccountIcon(accountsById.get(view.counterAccountId))}
        </div>
        <div className="transaction-details">
          <p className="transaction-details__title">
            {transaction.description}
          </p>
          <p className="transaction-details__description">
            {view.isSplit
              ? `Split · ${view.counterPostings.length} categories`
              : getAccountName(accounts, view.counterAccountId)}
          </p>
        </div>
        <div className="transaction-amount">
          <p
            className={`transaction-amount__value transaction-amount__value--${view.kind}`}
          >
            {isTransfer
              ? formatCurrency(view.amount)
              : formatCurrency(signedAmount, { showSign: true })}
          </p>
          <p className="transaction-amount__date">
            {formatDate(transaction.date)}
          </p>
        </div>
      </section>
    </Card>
  );
}
