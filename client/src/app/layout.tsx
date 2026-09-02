import React from 'react';
import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Providers } from '../store/Providers';
import Sidebar from '../components/Sidebar';
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
      <body className="bg-slate-50 text-slate-900 font-sans antialiased selection:bg-orange-500 selection:text-white overflow-hidden">
        <AntdRegistry>
          <Providers>
            <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
              <Sidebar />
              <main className="flex-1 flex flex-col h-full overflow-y-auto min-w-0">{children}</main>
            </div>
          </Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}
