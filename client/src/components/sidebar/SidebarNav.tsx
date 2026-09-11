'use client';

import React from 'react';
import Link from 'next/link';
import { Badge, Tooltip } from 'antd';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  activeGradient: string;
  activeShadow: string;
  textColor: string;
}

interface SidebarNavProps {
  navItems: NavItem[];
  pathname: string | null;
  collapsed?: boolean;
  onItemClick?: () => void;
}

export default function SidebarNav({
  navItems,
  pathname,
  collapsed = false,
  onItemClick,
}: SidebarNavProps) {
  return (
    <nav className="p-3 space-y-1.5">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/' && !item.href.startsWith('/menu/') && (pathname?.startsWith(item.href) ?? false)) ||
          (item.href.startsWith('/menu/') && (pathname?.startsWith('/menu/') ?? false));

        const linkContent = (
          <Link
            key={item.label}
            href={item.href}
            onClick={onItemClick}
            className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-sm transition-all relative ${
              isActive
                ? `bg-gradient-to-r ${item.activeGradient} text-white shadow-md ${item.activeShadow}`
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
            } ${collapsed ? 'justify-center !px-0' : ''}`}
          >
            <span className={`flex-shrink-0 flex items-center justify-center text-lg ${isActive ? 'text-white' : ''}`}>
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
            {linkContent}
          </Tooltip>
        ) : (
          linkContent
        );
      })}
    </nav>
  );
}
