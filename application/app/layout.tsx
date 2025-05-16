import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ServiceWorkerRegister from './sw-register';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Conclave - Modern Chat & Video Calls',
  description: 'Connect, collaborate, and communicate with crystal clarity',
  manifest: '/manifest.json',
  themeColor: '#7c2d12',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Conclave',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.className} bg-amber-950 text-amber-100`}>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
