'use client';

import { Button } from '@/shared/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import AccountForm from '../account-form/AccountForm';

export default function AddAccount() {
  const router = useRouter();

  return (
    <main className="account-page">
      <Button
        variant="secondary"
        size="small"
        className="account-page__back"
        onPress={() => router.back()}
      >
        <ArrowLeft size={16} /> <span>Back</span>
      </Button>
      <AccountForm />
    </main>
  );
}
