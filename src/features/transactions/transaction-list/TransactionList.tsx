import { TransactionCard } from '@/features/metrics/TransactionCard';

import './TransactionList.scss';

import { Transaction } from '@/entities/transaction';
import Link from 'next/link';

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({
  transactions,
}: TransactionListProps) {
  return (
    <section className="transaction-list">
      {transactions.map((transaction) => (
        <Link href={`/transactions/${transaction.id}`} key={transaction.id}>
          <TransactionCard transaction={transaction} />
        </Link>
      ))}
    </section>
  );
}
