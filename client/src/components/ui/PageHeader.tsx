'use client';

import React from 'react';
import { Tag } from 'antd';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconGradient?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  icon,
  iconGradient = 'from-orange-500 via-rose-500 to-amber-500',
  badge,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <div
      className={`p-4 md:p-5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-xs ${className}`}
    >
      <div className="flex items-center gap-3.5">
        {icon && (
          <div
            className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${iconGradient} flex items-center justify-center text-white shadow-md shadow-orange-500/20 flex-shrink-0`}
          >
            {icon}
          </div>
        )}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-black text-xl text-slate-900 tracking-tight leading-tight">
              {title}
            </h1>
            {badge && <div>{badge}</div>}
          </div>
          {subtitle && (
            <p className="text-xs font-semibold text-slate-500 line-clamp-1">{subtitle}</p>
          )}
        </div>
      </div>

      {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
    </div>
  );
}
