'use client';

import { Suspense } from 'react';
import { AccountForm } from '@/features/accounts/account-form';

import { AccountPageShell } from './AccountPageShell';

export function NewAccountPage() {
  return (
    <AccountPageShell title="New account">
      <Suspense>
        <AccountForm />
      </Suspense>
    </AccountPageShell>
  );
}
