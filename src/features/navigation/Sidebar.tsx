'use client';

import './Sidebar.scss';

import clsx from 'clsx';
import { PiggyBank } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NAV_ITEMS, type NavItem } from './nav-items';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <section className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <PiggyBank />
        </div>
        <span className="sidebar__logo-title">Fintrack</span>
      </section>
      <nav className="sidebar__nav" aria-label="Primary">
        <ul className="sidebar__list">
          {NAV_ITEMS.map((item) => (
            <SidebarItem key={item.href} {...item} pathname={pathname} />
          ))}
        </ul>
      </nav>
    </aside>
  );
}

function SidebarItem(props: NavItem & { pathname: string }) {
  const { href, label, icon: Icon, pathname } = props;
  return (
    <li>
      <Link
        href={href}
        className={clsx(
          'sidebar__item',
          pathname === href && 'sidebar__item--active',
        )}
      >
        <Icon size={20} />
        {label}
      </Link>
    </li>
  );
}
