import {
  CreditCard,
  DollarSign,
  House,
  RectangleHorizontal,
  Settings,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: House },
  { href: '/accounts', label: 'Accounts', icon: Wallet },
  { href: '/transactions', label: 'Transactions', icon: DollarSign },
  { href: '/budgets', label: 'Budgets', icon: RectangleHorizontal },
  { href: '/debts', label: 'Debts', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
];
