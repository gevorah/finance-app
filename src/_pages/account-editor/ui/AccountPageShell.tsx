'use client';

import { Button } from '@/shared/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import './account-editor.scss';

interface AccountPageShellProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AccountPageShell({
  title,
  children,
  footer,
}: AccountPageShellProps) {
  const router = useRouter();

  return (
    <div className="account-page">
      <Button
        variant="secondary"
        size="small"
        className="account-page__back"
        onPress={() => router.back()}
      >
        <ArrowLeft size={16} /> <span>Back</span>
      </Button>
      <section className="form-container">
        <h1 className="form-container__title">{title}</h1>
        {children}
        {footer && <section className="account-page__danger">{footer}</section>}
      </section>
    </div>
  );
}
