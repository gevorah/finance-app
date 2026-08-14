import { TransactionCard } from '@/features/transactions/transaction-card/TransactionCard';

import './TransactionList.scss';

import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Transaction } from '@/entities/transaction';
import { Receipt } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({
  transactions,
}: TransactionListProps) {
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
    <section className="transaction-list">
      {transactions.map((transaction) => (
        <Link href={`/transactions/${transaction.id}`} key={transaction.id}>
          <TransactionCard transaction={transaction} />
        </Link>
      ))}
    </section>
  );
}
