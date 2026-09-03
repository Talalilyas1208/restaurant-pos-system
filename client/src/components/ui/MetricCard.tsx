'use client';

import React from 'react';
import { RiseOutlined, FallOutlined } from '@ant-design/icons';

export type MetricColor = 'emerald' | 'orange' | 'blue' | 'purple' | 'rose' | 'amber';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: MetricColor;
  className?: string;
}

const colorStyles: Record<MetricColor, { bg: string; border: string; title: string; text: string; sub: string }> = {
  emerald: {
    bg: 'bg-emerald-50/80',
    border: 'border-emerald-200/90',
    title: 'text-emerald-800',
    text: 'text-emerald-700',
    sub: 'text-emerald-700',
  },
  orange: {
    bg: 'bg-orange-50/80',
    border: 'border-orange-200/90',
    title: 'text-orange-800',
    text: 'text-orange-600',
    sub: 'text-orange-700',
  },
  blue: {
    bg: 'bg-blue-50/80',
    border: 'border-blue-200/90',
    title: 'text-blue-800',
    text: 'text-blue-700',
    sub: 'text-blue-700',
  },
  purple: {
    bg: 'bg-purple-50/80',
    border: 'border-purple-200/90',
    title: 'text-purple-800',
    text: 'text-purple-700',
    sub: 'text-purple-700',
  },
  rose: {
    bg: 'bg-rose-50/80',
    border: 'border-rose-200/90',
    title: 'text-rose-800',
    text: 'text-rose-600',
    sub: 'text-rose-700',
  },
  amber: {
    bg: 'bg-amber-50/80',
    border: 'border-amber-200/90',
    title: 'text-amber-800',
    text: 'text-amber-700',
    sub: 'text-amber-700',
  },
};

export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'orange',
  className = '',
}: MetricCardProps) {
  const styles = colorStyles[color] || colorStyles.orange;

  return (
    <div
      className={`${styles.bg} ${styles.border} border p-5 rounded-3xl shadow-sm transition-all duration-200 hover:shadow-md space-y-1.5 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold uppercase tracking-wider block ${styles.title}`}>
          {title}
        </span>
        {icon && <div className={`text-lg ${styles.text}`}>{icon}</div>}
      </div>

      <div className={`text-2xl sm:text-3xl font-black ${styles.text} tracking-tight`}>
        {value}
      </div>

      <div className="flex items-center justify-between pt-0.5 text-xs font-semibold">
        {subtitle && <span className={styles.sub}>{subtitle}</span>}
        {trend && (
          <span
            className={`inline-flex items-center gap-1 font-bold ${
              trend.isPositive ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {trend.isPositive ? <RiseOutlined /> : <FallOutlined />}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}

