'use client';

import './AddBudget.scss';

import { Button } from '@/shared/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import BudgetForm from '../budget-form/BudgetForm';



export default function AddBudget() {
  const router = useRouter();
  return (
    <main className="add-budget-container">
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
        <BudgetForm/>
      </section>
    </main>
  );
}
