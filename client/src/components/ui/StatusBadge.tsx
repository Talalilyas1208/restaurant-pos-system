'use client';

import React from 'react';
import { Tag } from 'antd';
import { TableStatus, OrderStatus, PaymentStatus } from '../../types';

export type StatusVariant =
  | TableStatus
  | OrderStatus
  | PaymentStatus
  | 'online'
  | 'offline'
  | 'live'
  | 'in_stock'
  | 'out_of_stock';

interface StatusBadgeProps {
  status: StatusVariant | string;
  size?: 'small' | 'default' | 'large';
  showPulse?: boolean;
  className?: string;
  customLabel?: string;
}

export default function StatusBadge({
  status,
  size = 'default',
  showPulse = false,
  className = '',
  customLabel,
}: StatusBadgeProps) {
  const normalized = (status || '').toLowerCase();

  let color = 'default';
  let label = customLabel || status;
  let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
  let pulseColor = 'bg-slate-400';

  switch (normalized) {
    // Table statuses
    case 'available':
      color = 'success';
      label = customLabel || 'Available';
      bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      pulseColor = 'bg-emerald-500';
      break;
    case 'occupied':
      color = 'warning';
      label = customLabel || 'Occupied';
      bgClass = 'bg-orange-50 text-orange-700 border-orange-200';
      pulseColor = 'bg-orange-500';
      break;
    case 'reserved':
      color = 'processing';
      label = customLabel || 'Reserved';
      bgClass = 'bg-blue-50 text-blue-700 border-blue-200';
      pulseColor = 'bg-blue-500';
      break;
    case 'dirty':
      color = 'error';
      label = customLabel || 'Needs Cleaning';
      bgClass = 'bg-rose-50 text-rose-700 border-rose-200';
      pulseColor = 'bg-rose-500';
      break;

    // Order statuses
    case 'pending':
      color = 'warning';
      label = customLabel || 'Pending';
      bgClass = 'bg-amber-50 text-amber-800 border-amber-200';
      pulseColor = 'bg-amber-500';
      break;
    case 'preparing':
      color = 'processing';
      label = customLabel || 'In Kitchen';
      bgClass = 'bg-blue-50 text-blue-700 border-blue-200';
      pulseColor = 'bg-blue-500';
      break;
    case 'ready':
      color = 'success';
      label = customLabel || 'Ready to Serve';
      bgClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      pulseColor = 'bg-emerald-500';
      break;
    case 'completed':
    case 'served':
      color = 'default';
      label = customLabel || 'Completed';
      bgClass = 'bg-slate-100 text-slate-800 border-slate-200';
      pulseColor = 'bg-slate-500';
      break;
    case 'cancelled':
      color = 'error';
      label = customLabel || 'Cancelled';
      bgClass = 'bg-rose-50 text-rose-700 border-rose-200';
      pulseColor = 'bg-rose-500';
      break;

    // Payment statuses
    case 'paid':
      color = 'success';
      label = customLabel || 'Paid';
      bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      pulseColor = 'bg-emerald-500';
      break;
    case 'unpaid':
      color = 'error';
      label = customLabel || 'Unpaid';
      bgClass = 'bg-rose-50 text-rose-700 border-rose-200';
      pulseColor = 'bg-rose-500';
      break;
    case 'refunded':
      color = 'purple';
      label = customLabel || 'Refunded';
      bgClass = 'bg-purple-50 text-purple-700 border-purple-200';
      pulseColor = 'bg-purple-500';
      break;

    // Connectivity
    case 'online':
    case 'live':
      color = 'success';
      label = customLabel || 'LIVE';
      bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      pulseColor = 'bg-emerald-500';
      break;
    case 'offline':
      color = 'error';
      label = customLabel || 'OFFLINE';
      bgClass = 'bg-rose-50 text-rose-700 border-rose-200';
      pulseColor = 'bg-rose-500';
      break;

    // Stock
    case 'in_stock':
      color = 'success';
      label = customLabel || 'In Stock';
      bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      pulseColor = 'bg-emerald-500';
      break;
    case 'out_of_stock':
      color = 'error';
      label = customLabel || '86 / Sold Out';
      bgClass = 'bg-rose-50 text-rose-700 border-rose-200';
      pulseColor = 'bg-rose-500';
      break;
  }

  const sizeClass =
    size === 'small'
      ? '!text-[10px] !px-2 !py-0.2 !font-bold'
      : size === 'large'
      ? '!text-xs !px-3 !py-1 !font-black'
      : '!text-[11px] !px-2.5 !py-0.5 !font-bold';

  return (
    <Tag
      color={color}
      className={`!m-0 !rounded-lg !border inline-flex items-center gap-1.5 capitalize shadow-2xs ${sizeClass} ${bgClass} ${className}`}
    >
      {showPulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pulseColor} opacity-75`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${pulseColor}`} />
        </span>
      )}
      <span>{label}</span>
    </Tag>
  );
}
