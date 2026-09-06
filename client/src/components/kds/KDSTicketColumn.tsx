'use client';

import React from 'react';
import { Tag } from 'antd';
import { Order, OrderStatus } from '../../types';
import { KDSTicketCard, EmptyState } from '../ui';

interface KDSTicketColumnProps {
  title: string;
  badgeText: string;
  badgeColor: 'warning' | 'processing' | 'success';
  pulseColor: string;
  columnBg: string;
  borderClass: string;
  headerBg: string;
  titleColor: string;
  orders: Order[];
  emptyTitle: string;
  emptyDescription: string;
  emptyBg: string;
  emptyBorder: string;
  getElapsedMinutes: (dateStr: string) => number;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  isUpdating: boolean;
  isDark?: boolean;
}

export default function KDSTicketColumn({
  title,
  badgeText,
  badgeColor,
  pulseColor,
  columnBg,
  borderClass,
  headerBg,
  titleColor,
  orders,
  emptyTitle,
  emptyDescription,
  emptyBg,
  emptyBorder,
  getElapsedMinutes,
  onUpdateStatus,
  isUpdating,
  isDark = false,
}: KDSTicketColumnProps) {
  return (
    <div className={`flex flex-col ${isDark ? '!bg-slate-900 !border-slate-800' : columnBg} rounded-3xl border-2 ${isDark ? 'border-slate-800' : borderClass} overflow-hidden shadow-xs`}>
      <div className={`p-3.5 ${isDark ? '!bg-slate-800/80 border-slate-700' : headerBg} border-b ${isDark ? 'border-slate-700' : borderClass} flex items-center justify-between`}>
        <span className={`font-black text-sm ${isDark ? 'text-slate-100' : titleColor} flex items-center gap-2`}>
          <span className={`w-2.5 h-2.5 rounded-full ${pulseColor}`} />
          {title} ({orders.length})
        </span>
        <Tag color={badgeColor} className="!m-0 font-bold text-[11px] !rounded-md">
          {badgeText}
        </Tag>
      </div>

      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {orders.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            className={`!p-6 ${emptyBg} ${emptyBorder}`}
          />
        ) : (
          orders.map((order) => (
            <KDSTicketCard
              key={order.id}
              order={order}
              elapsedMinutes={getElapsedMinutes(order.createdAt)}
              onUpdateStatus={onUpdateStatus}
              isUpdating={isUpdating}
              isDark={isDark}
            />
          ))
        )}
      </div>
    </div>
  );
}

