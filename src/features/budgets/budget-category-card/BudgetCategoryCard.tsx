import { Budget } from '@/entities/budget';
import { getCategoryIcon, getCategoryLabel } from '@/entities/category';
import Bar from '@/shared/components/ui/bar/bar';
import { Card } from '@/shared/components/ui/card';

import './BudgetCategoryCard.scss';

import { formatCurrency } from '@/shared/lib/currency';
import { getBudgetProgress } from '@/stores/selectors';
import { useTransactionStore } from '@/stores/transactionStore';

import { getBudgetMessage } from './getBudgetMessage';

interface BudgetCategoryCardProps {
  budget: Budget;
}

export default function BudgetCategoryCard({
  budget,
}: BudgetCategoryCardProps) {
  const { transactions } = useTransactionStore();
  const { spent, percentage, remaining } = getBudgetProgress(
    budget,
    transactions,
  );
  const { text } = getBudgetMessage(budget.category, percentage, remaining);

  return (
    <Card className="budget-category-card">
      <div className="budget-category-header">
        <div className={`budget-category-header__icon`}>
          {getCategoryIcon(budget.category, 18)}
        </div>
        <div className="budget-category-info">
          <h4 className="budget-category-info__category"> {getCategoryLabel(budget.category)}</h4>
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
      <p className={`budget-remaining`}>{text}</p>
    </Card>
  );
}
