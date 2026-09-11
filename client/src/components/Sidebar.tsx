'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge, Tag } from 'antd';
import { ShoppingOutlined, MenuOutlined, CloseOutlined } from '@ant-design/icons';
import { UtensilsCrossed, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { RootState } from '../store';
import { api } from '../lib/api';
import SidebarNav from './sidebar/SidebarNav';
import SidebarFooter from './sidebar/SidebarFooter';
import { getNavItems } from './sidebar/sidebar.config';

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isOnline = useSelector((state: RootState) => state.posSession.isOnline);
  const cartItemsCount = useSelector((state: RootState) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  const { data: hotel } = useQuery({
    queryKey: ['hotel'],
    queryFn: ({ signal }) => api.getHotel(undefined, signal),
  });

  const { data: tables = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: ({ signal }) => api.getTables(signal),
  });

  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.getAnalytics(),
  });

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (pathname && pathname.startsWith('/menu/')) {
    return null;
  }

  const primaryQrToken = tables[0]?.qrCodeToken || 'gh-tbl-01';
  const hotelSlug = hotel?.slug || 'pos-project';
  const qrDemoUrl = `/menu/${hotelSlug}/${primaryQrToken}`;
  const navItems = getNavItems(qrDemoUrl, cartItemsCount, analytics?.activeOrders);

  const brandLogo = (
    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-rose-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20 text-white flex-shrink-0 overflow-hidden">
      {hotel?.logoUrl ? (
        <img src={hotel.logoUrl} alt={hotel.name || 'Brand Logo'} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
      ) : (
        <UtensilsCrossed className="w-5 h-5" />
      )}
    </div>
  );

  return (
    <>
      {/* ── MOBILE TOP BAR ──────────────────────────────────────────────── */}
      <div className="md:hidden flex items-center justify-between p-3.5 bg-white border-b border-slate-200 sticky top-0 z-40 w-full shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors border border-slate-200 text-base" aria-label="Open Navigation Menu">
            <MenuOutlined />
          </button>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden">{brandLogo}</div>
            <span className="font-black text-base text-slate-900 truncate">{hotel?.name || 'POS Project'}</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {cartItemsCount > 0 && (
            <Link href="/pos">
              <Badge count={cartItemsCount} overflowCount={99}>
                <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 font-bold text-sm">
                  <ShoppingOutlined />
                </div>
              </Badge>
            </Link>
          )}
          <Tag color={isOnline ? 'success' : 'error'} className="!m-0 !font-black !text-[10px] !rounded-lg !px-2 !py-0.5">
            {isOnline ? 'LIVE' : 'OFF'}
          </Tag>
        </div>
      </div>

      {/* ── MOBILE BACKDROP OVERLAY ─────────────────────────────────────── */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} className="md:hidden fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 transition-opacity animate-fadeIn" />
      )}

      {/* ── MOBILE DRAWER SIDEBAR ─────────────────────────────────────────── */}
      <aside className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 overflow-hidden">
              {brandLogo}
              <div className="min-w-0 flex-1">
                <div className="font-black text-base text-slate-900 truncate">{hotel?.name || 'POS Project'}</div>
                <p className="text-[11px] font-bold text-orange-600 truncate">{hotel?.tagline || 'Restaurant POS System'}</p>
              </div>
            </Link>
            <button onClick={() => setMobileOpen(false)} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors text-sm">
              <CloseOutlined />
            </button>
          </div>
          <SidebarNav navItems={navItems} pathname={pathname} onItemClick={() => setMobileOpen(false)} />
        </div>
        <SidebarFooter isOnline={isOnline} />
      </aside>

      {/* ── DESKTOP & TABLET SIDEBAR ──────────────────────────────────────── */}
      <aside className={`hidden md:flex flex-col justify-between bg-white border-r border-slate-200/90 transition-all duration-300 z-30 select-none shadow-sm flex-shrink-0 ${collapsed ? 'w-20' : 'w-64'}`}>
        <div>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 overflow-hidden group">
              {brandLogo}
              {!collapsed && (
                <div className="min-w-0 flex-1 transition-opacity duration-200">
                  <div className="font-black text-base leading-tight tracking-tight text-slate-900 truncate">{hotel?.name || 'POS Project'}</div>
                  <p className="text-[11px] font-bold text-orange-600 truncate mt-0.5">{hotel?.tagline || 'Restaurant POS System'}</p>
                </div>
              )}
            </Link>
            <button onClick={() => setCollapsed(!collapsed)} className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors text-xs border border-slate-200" title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>
          <SidebarNav navItems={navItems} pathname={pathname} collapsed={collapsed} />
        </div>
        <SidebarFooter isOnline={isOnline} collapsed={collapsed} />
      </aside>
    </>
  );
}
