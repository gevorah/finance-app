import Navbar from '@/features/navbar/Navbar';

import './AppShell.scss';

import { MobileNav } from '@/features/navigation/MobileNav';
import { Sidebar } from '@/features/navigation/Sidebar';
import { Fab } from '@/shared/components/ui/fab';
import { Plus } from 'lucide-react';

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
      <MobileNav />
      <Fab href="/create" label="New transaction" icon={<Plus size={24} />} />
    </div>
  );
}
