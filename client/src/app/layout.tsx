import React from 'react';
import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Providers } from '../store/Providers';
import Navbar from '../components/Navbar';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'POS Project — Restaurant POS & Digital QR Menu',
  description: 'Fullstack Point of Sale, Kitchen Display & Contactless QR Menu Platform with Ant Design & Tailwind CSS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans antialiased selection:bg-orange-500 selection:text-white">
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
