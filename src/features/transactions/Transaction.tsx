import "./Transaction.scss";

import { Button } from '@/shared/components/ui/button';
import { Funnel } from 'lucide-react';
import TransactionList from "./transaction-list/TransactionList";

export default function Transaction() {
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
        {/* <TransactionList></TransactionList> */}
      </div>
    </main>
  );
}
