import Navbar from '@/features/navbar/Navbar';

import './AppShell.scss';

import { Sidebar } from '@/features/sidebar/Sidebar';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell-container">
      <div className="app-header">
        <Navbar />
      </div>
      <div className="app-shell">
        <Sidebar />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
