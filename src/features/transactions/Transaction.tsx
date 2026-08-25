'use client';

import './Transaction.scss';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useHydrated } from '@/shared/hooks/useHydrated';
import { getTransactionsByMonth } from '@/entities/transaction';
import { useAccountsById } from '@/entities/account';
import {
  describeTransaction,
  useTransactionStore,
} from '@/entities/transaction';
import { getLocalTimeZone, today } from '@internationalized/date';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Funnel,
  Plus,
  Search,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import TransactionList from './transaction-list/TransactionList';
import { TransactionListSkeleton } from './transaction-list/TransactionListSkeleton';

export default function TransactionComponent() {
  const hydrated = useHydrated();
  const { transactions } = useTransactionStore();
  const accountsById = useAccountsById();
  const router = useRouter();
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
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
  const byType =
    filter === 'all'
      ? transactionsByMonth
      : transactionsByMonth.filter(
          (t) =>
            describeTransaction(t, accountsById).kind === filter,
        );
  const trimmedQuery = debouncedQuery.trim().toLowerCase();
  const filteredTransactions = trimmedQuery
    ? byType.filter((t) => t.description.toLowerCase().includes(trimmedQuery))
    : byType;
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
      <div className="search">
        <Search size={16} className="search__icon" />
        <input
          type="text"
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search__input"
          aria-label="Search transactions by description"
        />
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
        <Button
          variant={'secondary'}
          border={true}
          size={'medium'}
          onClick={() => setFilter('transfer')}
        >
          Transfer
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
        {hydrated ? (
          <TransactionList transactions={filteredTransactions} />
        ) : (
          <TransactionListSkeleton />
        )}
      </div>
    </main>
  );
}
