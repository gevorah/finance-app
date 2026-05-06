'use client';

import { TransactionCard } from '@/features/metrics/TransactionCard';

import './TransactionList.scss';

import { useTransactionStore } from '@/stores/transactionStore';
import Link from 'next/link';

interface TransactionListProps{
  filter?: string;
}

export default function TransactionList({ filter }: TransactionListProps) {
  const { transactions } = useTransactionStore();
  const filteredTransactions = filter === 'all' ? transactions : transactions.filter(t => t.type === filter);
  return (
    <section>
      {filteredTransactions.map((transaction) => (
        <Link href={`/transactions/${transaction.id}`} key={transaction.id}>
          <TransactionCard transaction={transaction} />
        </Link>
      ))}
    </section>
  );
}
