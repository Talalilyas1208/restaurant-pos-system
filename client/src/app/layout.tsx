import React from 'react';
import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Providers } from '../store/Providers';
import Navbar from '../components/Navbar';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Grand Horizon POS & QR Code Digital Menu',
  description: 'Fullstack Point of Sale, Kitchen Display & Contactless QR Menu Platform for Hotels & Restaurants with Ant Design & Tailwind CSS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans antialiased selection:bg-orange-500 selection:text-white">
        <AntdRegistry>
          <Providers>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
          </Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}
