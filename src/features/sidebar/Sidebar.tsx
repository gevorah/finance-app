import './Sidebar.scss';
import Link from 'next/link';
import {
  ChartNoAxesColumn,
  CreditCard,
  DollarSign,
  House,
  PiggyBank,
  Plus,
  Settings,
} from 'lucide-react';

export function Sidebar() {
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
          <li className="nav-list__item nav-list__item--active">
            <House size={20} />
            <Link href="/dashboard">Dashboard</Link>
          </li>
          <li className="nav-list__item">
            <DollarSign size={20} />
            <Link href="/transactions">Transactions</Link>
          </li>
          {/* button only on mobile*/}
          <li className="nav-list__item">
            <button className="nav-list__item--add">
              <Plus size={24} />
            </button>
          </li>
          <li className="nav-list__item">
            <ChartNoAxesColumn size={20} />
            <Link href="/analytics">Analytics</Link>
          </li>
          <li className="nav-list__item">
            <CreditCard size={20} />
            <Link href="/debts">Debts</Link>
          </li>
          <li className="nav-list__item">
            <Settings size={20} />
            <Link href="/settings">Settings</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
