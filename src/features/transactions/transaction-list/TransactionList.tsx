'use client';

import { TransactionCard } from '@/features/metrics/TransactionCard';

import './TransactionList.scss';

import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { useTransactionStore } from '@/stores/transactionStore';
import { Receipt } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TransactionList() {
  const { transactions } = useTransactionStore();
  const router = useRouter();

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<Receipt size={28} />}
        title="No transactions yet"
        description="Your transactions will show up here once you add your first one."
        action={
          <Button
            variant="primary"
            size="small"
            onPress={() => router.push('/create')}
          >
            Add transaction
          </Button>
        }
      />
    );
  }

  return (
    <section>
      {transactions.map((transaction) => (
        <Link href={`/transactions/${transaction.id}`} key={transaction.id}>
          <TransactionCard transaction={transaction} />
        </Link>
      ))}
    </section>
  );
}
