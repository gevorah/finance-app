'use client';

import { Button } from '@/shared/components/ui/button';
import { Plus } from 'lucide-react';

import { BudgetCard } from './budget-card/BudgetCard';

import './Budget.scss';

import { useBudgetStore } from '@/stores/budgetStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import BudgetCategoryCard from './budget-category-card/BudgetCategoryCard';

export default function BudgetComponent() {
  const { budget } = useBudgetStore();
  const router = useRouter();
  return (
    <div className="budget-list">
      <BudgetCard />
      <section className="budget-list-header">
        <h3 className="budget-list-header__title">By Category</h3>
        <Button
          size="small"
          className="budget-list-header__button"
          onPress={() => router.push('/budgets/create')}
        >
          <Plus size={14} /> Add
        </Button>
      </section>
      <section className="budget-list-items">
        {budget.map((item, key) => (
          <Link href={`/budgets/${item.id}`} key={key}>
            <BudgetCategoryCard budget={item} key={key} />
          </Link>
        ))}
      </section>
    </div>
  );
}
