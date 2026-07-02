import { Card } from '@/shared/components/ui/card';

import './BudgetCard.scss';

import Bar from '@/shared/components/ui/bar/bar';

interface BudgetCardProps{
    monthlyBudget: number;
    spent: number;
}

export function BudgetCard() {
  return (
    <Card type="primary" className="budget-card">
      <div className="budget-header">
        <h3 className="budget-header__title">MONTHLY BUDGET</h3>
        <p className="budget-header__remaining">$900 remaining</p>
      </div>
      <section className="budget-info">
        <p className="budget-amount">
          <span className="budget-amount__spent">$1000 </span>
          of $2000
        </p>
        <Bar percentage={50} />
        <p className="budget-message">
          You are on track. Budget left for 8 more days.
        </p>
      </section>
    </Card>
  );
}
