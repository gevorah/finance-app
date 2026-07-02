import { Budget } from '@/entities/budget';
import { getCategoryIcon } from '@/features/transactions/utils/getCategoryIcon';
import Bar from '@/shared/components/ui/bar/bar';
import { Card } from '@/shared/components/ui/card';

import './BudgetCategoryCard.scss';

import { getBudgetMessage } from './getBudgetMessage';

interface BudgetCategoryCardProps {
  budget: Budget;
}

export default function BudgetCategoryCard({
  budget,
}: BudgetCategoryCardProps) {
  const percentage = Math.round(
    ((budget.spent ?? 0) / budget.monthlyLimit) * 100,
  );
  const remaining = budget.monthlyLimit - (budget.spent ?? 0);
  const { text } = getBudgetMessage(budget.category, percentage, remaining);

  return (
    <Card className="budget-category-card">
      <div className="budget-category-header">
        <div className={`budget-category-header__icon`}>
          {getCategoryIcon(budget.category, 18)}
        </div>
        <div className="budget-category-info">
          <h4 className="budget-category-info__category"> {budget.category}</h4>
          <p className="budget-category-amount">
            <span className="budget-category-amount__spent">
              ${budget.spent?.toLocaleString()}{' '}
            </span>
            of ${budget.monthlyLimit.toLocaleString()}
          </p>
        </div>
        <p className="budget-category-header__percentage">{percentage}%</p>
      </div>
      <Bar percentage={percentage} />
      <p className={`budget-remaining`}>{text}</p>
    </Card>
  );
}
