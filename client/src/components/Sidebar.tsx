'use client';

import React, { useState, useEffect } from 'react';
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
  MenuOutlined,
  CloseOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { UtensilsCrossed, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { RootState } from '../store';
import { api } from '../lib/api';

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isOnline = useSelector((state: RootState) => state.posSession.isOnline);
  const cartItemsCount = useSelector((state: RootState) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  // Dynamically fetch hotel brand details and dining tables
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

  // Automatically close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // If customer is on the QR code table menu, hide sidebar completely for clean guest experience
  if (pathname && pathname.startsWith('/menu/')) {
    return null;
  }

  const primaryQrToken = tables[0]?.qrCodeToken || 'gh-tbl-01';
  const hotelSlug = hotel?.slug || 'pos-project';
  const qrDemoUrl = `/menu/${hotelSlug}/${primaryQrToken}`;

  const navItems = [
    {
      href: '/',
      label: 'Overview',
      icon: <AppstoreOutlined className="text-lg" />,
      activeGradient: 'from-blue-600 to-indigo-600',
      activeShadow: 'shadow-blue-500/20',
      textColor: 'text-blue-600',
    },
    {
      href: '/pos',
      label: 'POS Terminal',
      icon: <ShoppingOutlined className="text-lg" />,
      badge: cartItemsCount,
      activeGradient: 'from-orange-500 to-amber-500',
      activeShadow: 'shadow-orange-500/20',
      textColor: 'text-orange-600',
    },
    {
      href: '/kds',
      label: 'Kitchen KDS',
      icon: <FireOutlined className="text-lg" />,
      badge: analytics?.activeOrders,
      activeGradient: 'from-emerald-600 to-teal-600',
      activeShadow: 'shadow-emerald-600/20',
      textColor: 'text-emerald-600',
    },
    {
      href: qrDemoUrl,
      label: 'QR Table Menu',
      icon: <QrcodeOutlined className="text-lg" />,
      activeGradient: 'from-rose-500 to-pink-600',
      activeShadow: 'shadow-rose-500/20',
      textColor: 'text-rose-600',
    },
    {
      href: '/admin',
      label: 'Admin & Tables',
      icon: <SettingOutlined className="text-lg" />,
      activeGradient: 'from-purple-600 to-indigo-600',
      activeShadow: 'shadow-purple-600/20',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <>
      {/* ── MOBILE TOP BAR (Visible on < md screens) ───────────────────────── */}
      <div className="md:hidden flex items-center justify-between p-3.5 bg-white border-b border-slate-200 sticky top-0 z-40 w-full shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors border border-slate-200 text-base"
            aria-label="Open Navigation Menu"
          >
            <MenuOutlined />
          </button>

          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 via-rose-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20 text-white overflow-hidden">
              {hotel?.logoUrl ? (
                <img
                  src={hotel.logoUrl}
                  alt={hotel.name || 'Brand Logo'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <UtensilsCrossed className="w-4 h-4" />
              )}
            </div>
            <span className="font-black text-base text-slate-900 truncate">
              {hotel?.name || 'POS Project'}
            </span>
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
          <Tag
            color={isOnline ? 'success' : 'error'}
            className="!m-0 !font-black !text-[10px] !rounded-lg !px-2 !py-0.5"
          >
            {isOnline ? 'LIVE' : 'OFF'}
          </Tag>
        </div>
      </div>

      {/* ── MOBILE BACKDROP OVERLAY ────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 transition-opacity animate-fadeIn"
        />
      )}

      {/* ── MOBILE DRAWER SIDEBAR (Slides in from left) ────────────────────── */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Drawer Brand Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-rose-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20 text-white flex-shrink-0 overflow-hidden">
                {hotel?.logoUrl ? (
                  <img
                    src={hotel.logoUrl}
                    alt={hotel.name || 'Brand Logo'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <UtensilsCrossed className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-black text-base text-slate-900 truncate">
                  {hotel?.name || 'POS Project'}
                </div>
                <p className="text-[11px] font-bold text-orange-600 truncate">
                  {hotel?.tagline || 'Restaurant POS System'}
                </p>
              </div>
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors text-sm"
            >
              <CloseOutlined />
            </button>
          </div>

          {/* Drawer Nav Items */}
          <nav className="p-3 space-y-1.5">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && !item.href.startsWith('/menu/') && pathname.startsWith(item.href)) ||
                (item.href.startsWith('/menu/') && pathname.startsWith('/menu/'));

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-sm transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${item.activeGradient} text-white shadow-md ${item.activeShadow}`
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
                  }`}
                >
                  <span className="flex-shrink-0 flex items-center justify-center text-lg">
                    {item.icon}
                  </span>
                  <span className="flex-1 truncate tracking-tight">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge
                      count={item.badge}
                      overflowCount={99}
                      style={{
                        backgroundColor: isActive ? '#ffffff' : '#ea580c',
                        color: isActive ? '#ea580c' : '#ffffff',
                        fontWeight: '900',
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <div className={`flex items-center justify-between p-2.5 rounded-2xl border text-xs font-bold ${
            isOnline
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full animate-ping ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span>{isOnline ? 'System Online' : 'Offline'}</span>
            </div>
            <Tag color={isOnline ? 'success' : 'error'} className="!m-0 !text-[10px] !font-black !rounded-md">
              LIVE
            </Tag>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center font-black text-orange-600 text-xs">
                T1
              </div>
              <span className="font-bold text-slate-900">Station #1</span>
            </div>
            <Tag color="orange" className="!m-0 !font-mono !font-black text-[10px] !rounded-md">
              POS
            </Tag>
          </div>
        </div>
      </aside>

      {/* ── DESKTOP & TABLET SIDEBAR (Hidden on mobile, responsive width) ───── */}
      <aside
        className={`hidden md:flex flex-col justify-between bg-white border-r border-slate-200/90 transition-all duration-300 z-30 select-none shadow-sm flex-shrink-0 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 overflow-hidden group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-rose-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform text-white flex-shrink-0 overflow-hidden">
                {hotel?.logoUrl ? (
                  <img
                    src={hotel.logoUrl}
                    alt={hotel.name || 'Brand Logo'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <UtensilsCrossed className="w-5 h-5" />
                )}
              </div>

              {!collapsed && (
                <div className="min-w-0 flex-1 transition-opacity duration-200">
                  <div className="font-black text-base leading-tight tracking-tight text-slate-900 truncate">
                    {hotel?.name || 'POS Project'}
                  </div>
                  <p className="text-[11px] font-bold text-orange-600 truncate mt-0.5">
                    {hotel?.tagline || 'Restaurant POS System'}
                  </p>
                </div>
              )}
            </Link>

            {/* Collapse / Expand Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors text-xs border border-slate-200"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1.5">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && !item.href.startsWith('/menu/') && pathname.startsWith(item.href)) ||
                (item.href.startsWith('/menu/') && pathname.startsWith('/menu/'));

              const navLinkContent = (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-sm transition-all relative ${
                    isActive
                      ? `bg-gradient-to-r ${item.activeGradient} text-white shadow-md ${item.activeShadow}`
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
                  } ${collapsed ? 'justify-center !px-0' : ''}`}
                >
                  <span className={`flex-shrink-0 flex items-center justify-center ${isActive ? 'text-white' : ''}`}>
                    {item.icon}
                  </span>

                  {!collapsed && (
                    <span className="flex-1 truncate tracking-tight">{item.label}</span>
                  )}

                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge
                      count={item.badge}
                      overflowCount={99}
                      className={collapsed ? 'absolute -top-1 -right-1' : ''}
                      style={{
                        backgroundColor: isActive ? '#ffffff' : '#ea580c',
                        color: isActive ? '#ea580c' : '#ffffff',
                        fontWeight: '900',
                      }}
                    />
                  )}
                </Link>
              );

              return collapsed ? (
                <Tooltip key={item.label} title={item.label} placement="right">
                  {navLinkContent}
                </Tooltip>
              ) : (
                navLinkContent
              );
            })}
          </nav>
        </div>

        {/* Bottom Status Footer */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          <div className={`flex items-center gap-2 p-2 rounded-2xl border text-xs font-bold ${
            isOnline
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          } ${collapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full animate-ping ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {!collapsed && <span>{isOnline ? 'System Online' : 'Offline'}</span>}
            </div>
            {!collapsed && (
              <Tag color={isOnline ? 'success' : 'error'} className="!m-0 !text-[10px] !font-black !rounded-md">
                LIVE
              </Tag>
            )}
          </div>

          {!collapsed && (
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center font-black text-orange-600 text-xs flex-shrink-0">
                  T1
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-black text-slate-900 block truncate">Station Terminal #1</span>
                  <span className="text-[10px] font-semibold text-slate-500 block truncate">Ready for Orders</span>
                </div>
              </div>
              <Tag color="orange" className="!m-0 !font-mono !font-black text-[10px] !rounded-md">
                POS
              </Tag>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
