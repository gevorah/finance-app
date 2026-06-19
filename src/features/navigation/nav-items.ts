import {
  ChartNoAxesColumn,
  CreditCard,
  DollarSign,
  House,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: House },
  { href: '/transactions', label: 'Transactions', icon: DollarSign },
  { href: '/analytics', label: 'Analytics', icon: ChartNoAxesColumn },
  { href: '/debts', label: 'Debts', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
];
