import "./Transaction.scss";

import { Button } from '@/shared/components/ui/button';
import { Funnel } from 'lucide-react';
import TransactionList from "./transaction-list/TransactionList";

export default function TransactionComponent() {
  return (
    <main>
      <div className="options">
        <Button variant={'secondary'} border={true} size={'medium'}>
          All
        </Button>
        <Button variant={'secondary'} border={true} size={'medium'}>
          Income
        </Button>
        <Button variant={'secondary'} border={true} size={'medium'}>
          Expense
        </Button>
        <Button variant={'secondary'} border={true} size={'medium'}>
          <span><Funnel size={14}/></span>Filters
        </Button>
      </div>
      <div className="transaction-list">
        <TransactionList />
      </div>
    </main>
  );
}
