import {
  getAccountIcon,
  getAccountName,
  useAccountStore,
} from '@/entities/account';
import { Budget, getBudgetProgress } from '@/entities/budget';
import { useTransactionStore } from '@/entities/transaction';
import Bar from '@/shared/components/ui/bar/bar';
import { Card } from '@/shared/components/ui/card';
import { formatCurrency } from '@/shared/lib/currency';

import './BudgetCategoryCard.scss';

import { getBudgetMessage } from './getBudgetMessage';

interface BudgetCategoryCardProps {
  budget: Budget;
}

export default function BudgetCategoryCard({
  budget,
}: BudgetCategoryCardProps) {
  const { transactions } = useTransactionStore();
  const { accounts } = useAccountStore();
  const { spent, percentage, remaining } = getBudgetProgress(
    budget,
    transactions,
  );
  const account = accounts.find((item) => item.id === budget.accountId);
  const { text } = getBudgetMessage(budget.accountId, percentage, remaining);

  return (
    <Card className="budget-category-card">
      <div className="budget-category-header">
        <div className="budget-category-header__icon">
          {getAccountIcon(account, 18)}
        </div>
        <div className="budget-category-info">
          <h4 className="budget-category-info__category">
            {getAccountName(accounts, budget.accountId)}
          </h4>
          <p className="budget-category-amount">
            <span className="budget-category-amount__spent">
              {formatCurrency(spent)}{' '}
            </span>
            of {formatCurrency(budget.monthlyLimit)}
          </p>
        </div>
        <p className="budget-category-header__percentage">{percentage}%</p>
      </div>
      <Bar percentage={percentage} />
      <p className="budget-remaining">{text}</p>
    </Card>
  );
}
