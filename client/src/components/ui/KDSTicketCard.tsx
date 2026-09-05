'use client';

import React from 'react';
import { Card, Tag, Button, Popconfirm } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  FireOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Order, OrderStatus } from '../../types';
import StatusBadge from './StatusBadge';

interface KDSTicketCardProps {
  order: Order;
  elapsedMinutes: number;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  isUpdating?: boolean;
}

export default function KDSTicketCard({
  order,
  elapsedMinutes,
  onUpdateStatus,
  isUpdating = false,
}: KDSTicketCardProps) {
  const isOverdue = elapsedMinutes >= 15 && order.status !== 'completed';

  const orderTypeTagColor =
    order.orderType === 'dine_in'
      ? 'orange'
      : order.orderType === 'room_service'
      ? 'purple'
      : 'blue';

  return (
    <Card
      className={`!rounded-3xl shadow-sm transition-all overflow-hidden ${
        isOverdue
          ? '!bg-rose-50/90 !border-2 !border-rose-400 animate-pulse'
          : order.status === 'ready'
          ? '!bg-emerald-50/50 !border !border-emerald-200'
          : order.status === 'preparing'
          ? '!bg-blue-50/40 !border !border-blue-200'
          : '!bg-white !border !border-amber-200/90'
      }`}
      styles={{ body: { padding: '16px' } }}
    >
      {/* Top Ticket Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="font-black text-base text-slate-900">
            {order.tableNumber ? `Table ${order.tableNumber}` : `#${order.id.slice(-4).toUpperCase()}`}
          </span>
          <Tag color={orderTypeTagColor} className="!m-0 capitalize font-bold text-[10px] !rounded-md">
            {order.orderType.replace('_', ' ')}
          </Tag>
        </div>

        {/* Elapsed Timer */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black ${
            isOverdue
              ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-bounce'
              : 'bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <ClockCircleOutlined />
          <span>{elapsedMinutes}m ago</span>
        </div>
      </div>

      {/* Waiter / Guest attribution */}
      <div className="py-2 flex items-center justify-between text-[11px] font-bold text-slate-500">
        <span className="flex items-center gap-1 truncate">
          <UserOutlined className="text-orange-500" />
          <span>Server: {order.serverStaffName || 'Staff #1'}</span>
        </span>
        {order.customerNotes && (
          <span className="text-slate-700 truncate max-w-[120px]">
            Note: {order.customerNotes}
          </span>
        )}
      </div>

      {/* Order Items List */}
      <div className="py-2 space-y-2 border-t border-b border-slate-100 my-1">
        {order.items.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-orange-100 border border-orange-200 text-orange-700 font-black text-xs flex items-center justify-center flex-shrink-0">
                  {item.quantity}x
                </span>
                <span className="font-bold text-sm text-slate-900 leading-tight">
                  {item.name}
                </span>
              </div>
            </div>

            {/* Modifiers List */}
            {item.selectedModifiers && item.selectedModifiers.length > 0 && (
              <div className="pl-8 flex flex-wrap gap-1">
                {item.selectedModifiers.map((mod, mIdx) => (
                  <span
                    key={mIdx}
                    className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200"
                  >
                    + {mod.optionName || (mod as any).name}
                  </span>
                ))}
              </div>
            )}

            {/* Special Instructions */}
            {item.specialInstructions && (
              <div className="pl-8 text-[11px] font-bold text-rose-600 italic">
                &ldquo;{item.specialInstructions}&rdquo;
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons based on KDS state */}
      <div className="pt-3 flex items-center gap-2">
        {order.status === 'pending' && (
          <Button
            type="primary"
            block
            icon={<FireOutlined />}
            loading={isUpdating}
            onClick={() => onUpdateStatus(order.id, 'preparing')}
            className="!h-10 !rounded-xl !bg-gradient-to-r !from-blue-600 !to-indigo-600 hover:!from-blue-700 !font-bold !text-xs border-0 text-white shadow-sm"
          >
            Start Cooking
          </Button>
        )}

        {order.status === 'preparing' && (
          <Button
            type="primary"
            block
            icon={<CheckCircleOutlined />}
            loading={isUpdating}
            onClick={() => onUpdateStatus(order.id, 'ready')}
            className="!h-10 !rounded-xl !bg-gradient-to-r !from-emerald-600 !to-teal-600 hover:!from-emerald-700 !font-bold !text-xs border-0 text-white shadow-sm"
          >
            Ready to Serve
          </Button>
        )}

        {order.status === 'ready' && (
          <Button
            type="primary"
            block
            icon={<ThunderboltOutlined />}
            loading={isUpdating}
            onClick={() => onUpdateStatus(order.id, 'completed')}
            className="!h-10 !rounded-xl !bg-gradient-to-r !from-indigo-600 !to-violet-600 hover:!from-indigo-700 !font-bold !text-xs border-0 text-white shadow-sm"
          >
            Complete Ticket
          </Button>
        )}
      </div>
    </Card>
  );
}
