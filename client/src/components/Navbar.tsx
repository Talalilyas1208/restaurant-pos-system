'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge, Tag, Button, Tooltip } from 'antd';
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

  const navItems = [
    { href: '/', label: 'Overview', icon: <AppstoreOutlined /> },
    { href: '/pos', label: 'POS Terminal', icon: <ShoppingOutlined />, badge: cartItemsCount },
    { href: '/kds', label: 'Kitchen KDS', icon: <FireOutlined /> },
    { href: '/menu/grand-horizon/gh-tbl-01', label: 'QR Menu Demo', icon: <QrcodeOutlined /> },
    { href: '/admin', label: 'Admin & QR Generator', icon: <SettingOutlined /> },
  ];

  return (
    <header className="bg-slate-900/95 backdrop-blur border-b border-slate-800/90 sticky top-0 z-50 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg leading-tight tracking-tight flex items-center gap-2 text-white">
                Grand Horizon <Tag color="orange" className="!m-0 !text-[11px] font-semibold border-orange-500/30">POS Pro</Tag>
              </div>
              <p className="text-xs text-slate-400">Hotel & Restaurant Management</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    type={isActive ? 'primary' : 'text'}
                    icon={item.icon}
                    className={`!flex !items-center !gap-1.5 !font-medium !text-sm !h-10 !px-3.5 !rounded-xl transition-all ${
                      isActive
                        ? '!bg-orange-500 !text-white !shadow-md !shadow-orange-500/20'
                        : '!text-slate-300 hover:!text-white hover:!bg-slate-800'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge
                        count={item.badge}
                        overflowCount={99}
                        className="ml-1"
                        style={{ backgroundColor: '#ffffff', color: '#ea580c', fontWeight: 'bold' }}
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
              className="!flex !items-center !gap-1.5 !px-3 !py-1 !rounded-full !text-xs !font-medium"
            >
              {isOnline ? 'System Online' : 'Offline Mode'}
            </Tag>

            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-800 text-xs text-slate-400">
              <span className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-orange-400">
                CH
              </span>
              <span className="text-slate-200 font-medium">Terminal #1</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
