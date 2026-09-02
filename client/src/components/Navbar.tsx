'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge, Tag, Button } from 'antd';
import {
  AppstoreOutlined,
  ShoppingOutlined,
  FireOutlined,
  QrcodeOutlined,
  SettingOutlined,
  WifiOutlined,
} from '@ant-design/icons';
import { UtensilsCrossed } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function Navbar() {
  const pathname = usePathname();
  const isOnline = useSelector((state: RootState) => state.posSession.isOnline);
  const cartItemsCount = useSelector((state: RootState) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  // If customer is on the QR code table menu, hide the staff navbar completely
  if (pathname && pathname.startsWith('/menu/')) {
    return null;
  }

  const navItems = [
    { href: '/', label: 'Overview', icon: <AppstoreOutlined />, activeGradient: 'from-blue-600 to-indigo-600', activeColor: 'bg-blue-600' },
    { href: '/pos', label: 'POS Terminal', icon: <ShoppingOutlined />, badge: cartItemsCount, activeGradient: 'from-orange-500 to-amber-500', activeColor: 'bg-orange-600' },
    { href: '/kds', label: 'Kitchen KDS', icon: <FireOutlined />, activeGradient: 'from-emerald-600 to-teal-600', activeColor: 'bg-emerald-600' },
    { href: '/menu/pos-project/gh-tbl-01', label: 'QR Menu Demo', icon: <QrcodeOutlined />, activeGradient: 'from-rose-500 to-pink-600', activeColor: 'bg-rose-600' },
    { href: '/admin', label: 'Admin & Tables', icon: <SettingOutlined />, activeGradient: 'from-purple-600 to-indigo-600', activeColor: 'bg-purple-600' },
  ];

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 text-slate-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-rose-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform text-white">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-lg leading-tight tracking-tight flex items-center gap-2 text-slate-900">
                POS Project <Tag color="orange" className="!m-0 !text-[11px] !font-black !rounded-md !border-orange-200 !bg-orange-50 !text-orange-700">PRO</Tag>
              </div>
              <p className="text-xs font-semibold text-slate-500">Restaurant POS & QR Digital Dining</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    type={isActive ? 'primary' : 'text'}
                    icon={item.icon}
                    className={`!flex !items-center !gap-1.5 !font-bold !text-sm !h-10 !px-4 !rounded-xl transition-all ${
                      isActive
                        ? `!bg-gradient-to-r ${item.activeGradient} !text-white !shadow-md !shadow-orange-500/10 border-0`
                        : '!text-slate-600 hover:!text-slate-900 hover:!bg-slate-100 !border-0 font-semibold'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge
                        count={item.badge}
                        overflowCount={99}
                        className="ml-1"
                        style={{ backgroundColor: '#ea580c', color: '#ffffff', fontWeight: 'bold' }}
                      />
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Right Status */}
          <div className="flex items-center gap-3">
            <Tag
              color={isOnline ? 'success' : 'error'}
              icon={<WifiOutlined />}
              className="!flex !items-center !gap-1.5 !px-3 !py-1 !rounded-full !text-xs !font-bold !border-emerald-200 !bg-emerald-50 !text-emerald-700"
            >
              {isOnline ? 'Live Online' : 'Offline'}
            </Tag>

            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200 text-xs text-slate-500">
              <span className="w-8 h-8 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center font-black text-orange-600">
                P1
              </span>
              <span className="text-slate-800 font-bold">Terminal #1</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
