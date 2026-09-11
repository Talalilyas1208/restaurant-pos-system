import React from 'react';
import {
  AppstoreOutlined,
  ShoppingOutlined,
  FireOutlined,
  QrcodeOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { NavItem } from './SidebarNav';

export function getNavItems(
  qrDemoUrl: string,
  cartItemsCount: number,
  activeOrders?: number
): NavItem[] {
  return [
    {
      href: '/',
      label: 'Overview',
      icon: React.createElement(AppstoreOutlined, { className: 'text-lg' }),
      activeGradient: 'from-blue-600 to-indigo-600',
      activeShadow: 'shadow-blue-500/20',
      textColor: 'text-blue-600',
    },
    {
      href: '/pos',
      label: 'POS Terminal',
      icon: React.createElement(ShoppingOutlined, { className: 'text-lg' }),
      badge: cartItemsCount,
      activeGradient: 'from-orange-500 to-amber-500',
      activeShadow: 'shadow-orange-500/20',
      textColor: 'text-orange-600',
    },
    {
      href: '/kds',
      label: 'Kitchen KDS',
      icon: React.createElement(FireOutlined, { className: 'text-lg' }),
      badge: activeOrders,
      activeGradient: 'from-emerald-600 to-teal-600',
      activeShadow: 'shadow-emerald-600/20',
      textColor: 'text-emerald-600',
    },
    {
      href: qrDemoUrl,
      label: 'QR Table Menu',
      icon: React.createElement(QrcodeOutlined, { className: 'text-lg' }),
      activeGradient: 'from-rose-500 to-pink-600',
      activeShadow: 'shadow-rose-500/20',
      textColor: 'text-rose-600',
    },
    {
      href: '/admin',
      label: 'Admin & Tables',
      icon: React.createElement(SettingOutlined, { className: 'text-lg' }),
      activeGradient: 'from-purple-600 to-indigo-600',
      activeShadow: 'shadow-purple-600/20',
      textColor: 'text-purple-600',
    },
  ];
}
