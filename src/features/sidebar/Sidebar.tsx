import './Sidebar.scss';

import {
  ChartNoAxesColumn,
  CreditCard,
  DollarSign,
  House,
  PiggyBank,
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
            Dashboard
          </li>
          <li className="nav-list__item">
            <DollarSign size={20} />
            Transactions
          </li>
          <li className="nav-list__item">
            <ChartNoAxesColumn size={20} />
            Analytics
          </li>
          <li className="nav-list__item">
            <CreditCard size={20} />
            Debts
          </li>
          <li className="nav-list__item">
            <Settings size={20} />
            Settings
          </li>
        </ul>
      </nav>
    </aside>
  );
}
