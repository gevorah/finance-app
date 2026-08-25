'use client';

import './MobileHeader.scss';

import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  '/transactions': 'Transactions',
  '/analytics': 'Analytics',
  '/debts': 'Debts',
  '/settings': 'Settings',
  '/create': 'New transaction',
  '/budgets': 'Budgets',
  '/accounts': 'Accounts',
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  if (hour < 22) return 'Good evening';
  return 'Good night';
}

function getTitle(pathname: string): string {
  if (pathname === '/dashboard' || pathname === '/') return getGreeting();
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/transactions/')) return 'Transaction';
  return '';
}

export function MobileHeader() {
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <header className="mobile-header">
      {/* Server renders with server time; client re-renders with user's local time. */}
      <h1 className="mobile-header__title" suppressHydrationWarning>
        {title}
      </h1>
    </header>
  );
}
