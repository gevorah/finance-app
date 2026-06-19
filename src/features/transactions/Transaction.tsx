'use client';

import './Transaction.scss';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { getTransactionsByMonth } from '@/stores/selectors';
import { useTransactionStore } from '@/stores/transactionStore';
import { getLocalTimeZone, today } from '@internationalized/date';
import { Calendar, ChevronLeft, ChevronRight, Funnel, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import TransactionList from './transaction-list/TransactionList';

export default function TransactionComponent() {
  const { transactions } = useTransactionStore();
  const router = useRouter();
  const [filter, setFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(today(getLocalTimeZone()));
  const handleBackMonth = () => {
    setSelectedDate(selectedDate.subtract({ months: 1 }));
  };
  const handleForwardMonth = () => {
    setSelectedDate(selectedDate.add({ months: 1 }));
  };
  const transactionsByMonth = getTransactionsByMonth(
    transactions,
    selectedDate.year,
    selectedDate.month,
  );
  const filteredTransactions =
    filter === 'all'
      ? transactionsByMonth
      : transactionsByMonth.filter((t) => t.type === filter);
  return (
    <main>
      <div className="page-header">
        <Button
          variant="primary"
          size="medium"
          onPress={() => router.push('/create')}
        >
          <Plus size={16} /> New transaction
        </Button>
      </div>
      <div className="options">
        <Button
          variant={'secondary'}
          border={true}
          size={'medium'}
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={'secondary'}
          border={true}
          size={'medium'}
          onClick={() => setFilter('income')}
        >
          Income
        </Button>
        <Button
          variant={'secondary'}
          border={true}
          size={'medium'}
          onClick={() => setFilter('expense')}
        >
          Expense
        </Button>
        <Button variant={'secondary'} border={true} size={'medium'}>
          <span>
            <Funnel size={14} />
          </span>
          Filters
        </Button>
      </div>
      <div className="month-selector">
        <Button variant={'secondary'} className="month-button" onClick={handleBackMonth}>
          <ChevronLeft />
        </Button>
        <span className="month-label">
          <Calendar size={16}/>
          {new Date(
            selectedDate.year,
            selectedDate.month - 1,
          ).toLocaleDateString('en', { month: 'long' })}{' '}
          {selectedDate.year}
        </span>
        <Button variant={'secondary'} className="month-button" onClick={handleForwardMonth}>
          <ChevronRight />
        </Button>
      </div>
      <div className="transaction-list">
        <TransactionList transactions={filteredTransactions} />
      </div>
    </main>
  );
}
