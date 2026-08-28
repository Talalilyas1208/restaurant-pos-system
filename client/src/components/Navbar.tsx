'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UtensilsCrossed,
  QrCode,
  ChefHat,
  Receipt,
  Settings,
  Wifi,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function Navbar() {
  const pathname = usePathname();
  const isOnline = useSelector((state: RootState) => state.posSession.isOnline);
  const cartItemsCount = useSelector((state: RootState) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  const links = [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/pos', label: 'POS Terminal', icon: Receipt, badge: cartItemsCount > 0 ? cartItemsCount : undefined },
    { href: '/kds', label: 'Kitchen KDS', icon: ChefHat },
    { href: '/menu/grand-horizon/gh-tbl-01', label: 'QR Menu Demo', icon: QrCode },
    { href: '/admin', label: 'Admin & QR Generator', icon: Settings },
  ];

  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-50 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg leading-tight tracking-tight flex items-center gap-2">
                Grand Horizon <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30">POS Pro</span>
              </div>
              <p className="text-xs text-slate-400">Hotel & Restaurant Management</p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                  {link.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-orange-500 text-white rounded-full font-bold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Status / Cashier Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-slate-300 hidden sm:inline">{isOnline ? 'System Online' : 'Offline Mode'}</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-800 text-xs text-slate-400">
              <span className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-200">
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
