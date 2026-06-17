'use client';

import './MobileNav.scss';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NAV_ITEMS, type NavItem } from './nav-items';

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav" aria-label="Primary">
      <ul className="mobile-nav__list">
        {NAV_ITEMS.map((item) => (
          <MobileNavItem key={item.href} {...item} pathname={pathname} />
        ))}
      </ul>
    </nav>
  );
}

function MobileNavItem(props: NavItem & { pathname: string }) {
  const { href, label, icon: Icon, pathname } = props;
  return (
    <li>
      <Link
        href={href}
        className={clsx(
          'mobile-nav__item',
          pathname === href && 'mobile-nav__item--active',
        )}
      >
        <Icon size={24} />
        <span className="mobile-nav__label">{label}</span>
      </Link>
    </li>
  );
}
