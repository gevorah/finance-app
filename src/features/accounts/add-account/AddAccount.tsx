'use client';

import { Button } from '@/shared/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import AccountForm from '../account-form/AccountForm';

export default function AddAccount() {
  const router = useRouter();

  return (
    <main>
      <div className="back-section">
        <Button variant="secondary" size="small" onPress={() => router.back()}>
          <ArrowLeft /> <span>Back</span>
        </Button>
      </div>
      <AccountForm />
    </main>
  );
}
