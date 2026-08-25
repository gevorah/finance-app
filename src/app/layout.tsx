import '@/shared/styles/globals.scss';
import './layout.scss';

import { MobileHeader } from '@/features/navigation/MobileHeader';
import { MobileNav } from '@/features/navigation/MobileNav';
import { Sidebar } from '@/features/navigation/Sidebar';
import { Fab } from '@/shared/components/ui/fab';
import { Plus } from 'lucide-react';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import localFont from 'next/font/local';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

const testTiemposFine = localFont({
  src: '../../public/fonts/test-tiempos-fine-vf-italic.woff2',
  display: 'swap',
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Finance App',
  description: 'A finance management application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${testTiemposFine.variable}`}
    >
      <body suppressHydrationWarning>
        <div className="app-shell-container">
          <div className="app-header">
            <MobileHeader />
          </div>
          <div className="app-shell">
            <Sidebar />
            <main className="app-content">{children}</main>
          </div>
          <MobileNav />
          <Fab
            href="/create"
            label="New transaction"
            icon={<Plus size={24} />}
          />
        </div>
      </body>
    </html>
  );
}
