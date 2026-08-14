'use client';

import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { PiggyBank, Plus } from 'lucide-react';

import { BudgetCard } from './budget-card/BudgetCard';

import './Budget.scss';

import { useBudgetStore } from '@/stores/budgetStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import BudgetCategoryCard from './budget-category-card/BudgetCategoryCard';

export default function BudgetComponent() {
  const { budgets } = useBudgetStore();
  const router = useRouter();
  if (budgets.length === 0) {
    return (
      <div className="budget-list">
        <EmptyState
          icon={<PiggyBank size={28} />}
          title="No budgets yet"
          description="Set a monthly limit per category and see how much you have left to spend."
          action={
            <Button
              variant="primary"
              size="small"
              onPress={() => router.push('/budgets/create')}
            >
              Add budget
            </Button>
          }
        />
      </div>
    );
  }

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
        {budgets.map((item) => (
          <Link href={`/budgets/${item.id}`} key={item.id}>
            <BudgetCategoryCard budget={item} />
          </Link>
        ))}
      </section>
    </div>
  );
}
