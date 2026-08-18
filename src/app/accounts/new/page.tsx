import { Suspense } from 'react';
import AddAccount from '@/features/accounts/add-account/AddAccount';

export default function Page() {
  return (
    <main>
      <Suspense>
        <AddAccount />
      </Suspense>
    </main>
  );
}
