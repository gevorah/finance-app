import '@/shared/styles/globals.scss';

import { AppShell } from '@/widgets/app-shell';
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
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
