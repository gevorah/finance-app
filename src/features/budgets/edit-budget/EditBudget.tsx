'use client';

import { Button } from '@/shared/components/ui/button';
import { useBudgetStore } from '@/stores/budgetStore';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import BudgetForm from '../budget-form/BudgetForm';

export default function EditBudget() {
  const { budget } = useBudgetStore();
  const { id } = useParams();
  const budgetDetail = budget.find((budgetId) => budgetId.id === id);
  const router = useRouter();
  return (
    <main className="edit-budget-container">
      <div className="back-section">
        <Button
          variant={'secondary'}
          size={'small'}
          onPress={() => router.back()}
        >
          <ArrowLeft /> <span>Back</span>
        </Button>
      </div>
      <section className="form-container">
        <BudgetForm budgetInfo={budgetDetail} />
      </section>
    </main>
  );
}
