import { TransactionCard } from '@/features/metrics/TransactionCard';

import './TransactionList.scss';
import { Transaction } from '../types';

interface TransactionListProps{
    transactions: Transaction[];
}

export default function TransactionList({transactions}: TransactionListProps) {
  return (
    <section>
{/*       <TransactionCard
        icon={<Coffee size={20} />}
        title={'Starbucks Coffee'}
        description={'Food & Drinks'}
        value={'-$5.80'}
        date={'Today'}
      ></TransactionCard> */}
      {transactions.map((transaction)=>(
        <TransactionCard key={transaction.id} transaction={transaction} />
      ))}
      
    </section>
  );
}
