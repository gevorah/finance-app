'use client';

import { TransactionCard } from '@/features/metrics/TransactionCard';

import './TransactionList.scss';

import { useTransactionStore } from '@/stores/transactionStore';
import Link from 'next/link';

/* interface TransactionListProps{
    transactions: Transaction[];
} */

export default function TransactionList() {
  const { transactions } = useTransactionStore();
  return (
    <section>
      {transactions.map((transaction) => (
        <Link href={`/transactions/${transaction.id}`} key={transaction.id}>
          <TransactionCard key={transaction.id} transaction={transaction} />
        </Link>
      ))}
    </section>
  );
}
