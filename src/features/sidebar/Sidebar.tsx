'use client';

import './Sidebar.scss';

import clsx from 'clsx';
import {
  ChartNoAxesColumn,
  CreditCard,
  DollarSign,
  House,
  PiggyBank,
  Plus,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: House },
  { href: '/transactions', label: 'Transactions', icon: DollarSign },
  { href: '/analytics', label: 'Analytics', icon: ChartNoAxesColumn },
  { href: '/debts', label: 'Debts', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const CREATE_BUTTON_INDEX = 1;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar-container">
      <section className="sidebar-logo">
        <div className="sidebar-logo__icon">
          <PiggyBank />
        </div>
        <span className="sidebar-logo__title">Fintrack</span>
      </section>
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {NAV_ITEMS.slice(0, CREATE_BUTTON_INDEX + 1).map((item) => (
            <NavListItem key={item.href} item={item} pathname={pathname} />
          ))}
          <li>
            <Link
              href="/create"
              className="nav-list__item--add"
              aria-label="Create"
            >
              <Plus size={24} />
            </Link>
          </li>
          {NAV_ITEMS.slice(CREATE_BUTTON_INDEX + 1).map((item) => (
            <NavListItem key={item.href} item={item} pathname={pathname} />
          ))}
        </ul>
      </nav>
    </aside>
  );
}

function NavListItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const { href, label, icon: Icon } = item;
  return (
    <li>
      <Link
        href={href}
        className={clsx(
          'nav-list__item',
          pathname === href && 'nav-list__item--active',
        )}
      >
        <Icon size={20} />
        {label}
      </Link>
    </li>
  );
}
