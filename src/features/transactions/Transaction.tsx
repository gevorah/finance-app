import "./Transaction.scss";

import { Button } from '@/shared/components/ui/button';
import { Funnel } from 'lucide-react';
import { CATEGORY_TYPES, Transaction } from './types';
import TransactionList from "./transaction-list/TransactionList";

const ListMock: Transaction[] = [
  {
    id: '1',
    type: 'expense',
    title: 'Starbucks Coffee',
    category: CATEGORY_TYPES.Food,
    amount: -5.80,
    date: 'Today',
    description: 'Morning coffee',
    createdAt: '2026-03-06T08:30:00',
    updatedAt: '2026-03-06T08:30:00'
  },
  {
    id: '2',
    type: 'income',
    title: 'Salary Deposit',
    category: CATEGORY_TYPES.Income,
    amount: 4500.00,
    date: 'Yesterday',
    description: 'Monthly salary',
    createdAt: '2026-03-05T00:00:00',
    updatedAt: '2026-03-05T00:00:00'
  },
  {
    id: '3',
    type: 'expense',
    title: 'Amazon Purchase',
    category: CATEGORY_TYPES.Shopping,
    amount: -89.99,
    date: 'Jan 3',
    description: 'Electronics',
    createdAt: '2026-01-03T14:20:00',
    updatedAt: '2026-01-03T14:20:00'
  },
  {
    id: '4',
    type: 'expense',
    title: 'Uber Ride',
    category: CATEGORY_TYPES.Transport,
    amount: -24.50,
    date: 'Jan 2',
    description: 'To downtown',
    createdAt: '2026-01-02T18:45:00',
    updatedAt: '2026-01-02T18:45:00'
  },
  {
    id: '5',
    type: 'expense',
    title: 'Rent Payment',
    category: CATEGORY_TYPES.Bills,
    amount: -1200.00,
    date: 'Jan 1',
    description: 'Monthly rent',
    createdAt: '2026-01-01T10:00:00',
    updatedAt: '2026-01-01T10:00:00'
  },
  {
    id: '6',
    type: 'expense',
    title: 'Grocery Store',
    category: CATEGORY_TYPES.Food,
    amount: -156.32,
    date: 'Dec 30',
    description: 'Weekly groceries',
    createdAt: '2025-12-30T16:20:00',
    updatedAt: '2025-12-30T16:20:00'
  },
  {
    id: '7',
    type: 'expense',
    title: 'Netflix Subscription',
    category: CATEGORY_TYPES.Bills,
    amount: -15.99,
    date: 'Dec 28',
    description: 'Monthly subscription',
    createdAt: '2025-12-28T00:00:00',
    updatedAt: '2025-12-28T00:00:00'
  },
  {
    id: '8',
    type: 'income',
    title: 'Freelance Project',
    category: CATEGORY_TYPES.Income,
    amount: 850.00,
    date: 'Dec 27',
    description: 'Web design project',
    createdAt: '2025-12-27T15:30:00',
    updatedAt: '2025-12-27T15:30:00'
  },
  {
    id: '9',
    type: 'expense',
    title: 'Restaurant Dinner',
    category: CATEGORY_TYPES.Food,
    amount: -67.45,
    date: 'Dec 26',
    description: 'Dinner with friends',
    createdAt: '2025-12-26T20:00:00',
    updatedAt: '2025-12-26T20:00:00'
  },
  {
    id: '10',
    type: 'expense',
    title: 'Gas Station',
    category: CATEGORY_TYPES.Transport,
    amount: -45.00,
    date: 'Dec 25',
    description: 'Full tank',
    createdAt: '2025-12-25T11:20:00',
    updatedAt: '2025-12-25T11:20:00'
  },
  {
    id: '11',
    type: 'expense',
    title: 'Pharmacy',
    category: CATEGORY_TYPES.Health,
    amount: -32.50,
    date: 'Dec 23',
    description: 'Medications',
    createdAt: '2025-12-23T09:15:00',
    updatedAt: '2025-12-23T09:15:00'
  },
  {
    id: '12',
    type: 'expense',
    title: 'Gym Membership',
    category: CATEGORY_TYPES.Health,
    amount: -50.00,
    date: 'Dec 20',
    description: 'Monthly fee',
    createdAt: '2025-12-20T12:00:00',
    updatedAt: '2025-12-20T12:00:00'
  },
  {
    id: '13',
    type: 'expense',
    title: 'Pizza Delivery',
    category: CATEGORY_TYPES.Food,
    amount: -28.99,
    date: 'Dec 18',
    description: 'Friday night dinner',
    createdAt: '2025-12-18T19:30:00',
    updatedAt: '2025-12-18T19:30:00'
  },
  {
    id: '14',
    type: 'expense',
    title: 'Credit Card Payment',
    category: CATEGORY_TYPES.Bills,
    amount: -350.00,
    date: 'Dec 15',
    description: 'Minimum payment',
    createdAt: '2025-12-15T10:00:00',
    updatedAt: '2025-12-15T10:00:00'
  },
  {
    id: '15',
    type: 'income',
    title: 'Investment Return',
    category: CATEGORY_TYPES.Income,
    amount: 125.50,
    date: 'Dec 12',
    description: 'Dividend payment',
    createdAt: '2025-12-12T14:00:00',
    updatedAt: '2025-12-12T14:00:00'
  },
  {
    id: '16',
    type: 'expense',
    title: 'Bus Pass',
    category: CATEGORY_TYPES.Transport,
    amount: -80.00,
    date: 'Dec 10',
    description: 'Monthly pass',
    createdAt: '2025-12-10T08:00:00',
    updatedAt: '2025-12-10T08:00:00'
  },
  {
    id: '17',
    type: 'expense',
    title: 'Electricity Bill',
    category: CATEGORY_TYPES.Bills,
    amount: -95.30,
    date: 'Dec 8',
    description: 'Monthly utility',
    createdAt: '2025-12-08T00:00:00',
    updatedAt: '2025-12-08T00:00:00'
  },
  {
    id: '18',
    type: 'expense',
    title: 'Online Course',
    category: CATEGORY_TYPES.Others,
    amount: -49.99,
    date: 'Dec 5',
    description: 'React masterclass',
    createdAt: '2025-12-05T16:45:00',
    updatedAt: '2025-12-05T16:45:00'
  },
];

export default function TransactionComponent() {
  return (
    <main>
      <div className="options">
        <Button type={'secondary'} border={true} size={'medium'} active={true}>
          All
        </Button>
        <Button type={'secondary'} border={true} size={'medium'}>
          Income
        </Button>
        <Button type={'secondary'} border={true} size={'medium'}>
          Expense
        </Button>
        <Button type={'secondary'} border={true} size={'medium'}>
          <span><Funnel size={14}/></span>Filters
        </Button>
      </div>
      <div className="transaction-list">
        <TransactionList transactions={ListMock} />
      </div>
    </main>
  );
}
