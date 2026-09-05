'use client';

import React from 'react';
import { Steps, Tag, Button, Tooltip } from 'antd';
import {
  ClockCircleOutlined,
  FireOutlined,
  CheckCircleOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { Order } from '../../types';

export interface LiveOrderTrackerProps {
  order?: Order | null;
  tableNumber?: string;
  onCallWaiter?: () => void;
  className?: string;
}

export default function LiveOrderTracker({
  order,
  tableNumber = 'T-01',
  onCallWaiter,
  className = '',
}: LiveOrderTrackerProps) {
  if (!order) return null;

  const getStepStatus = () => {
    if (order.status === 'pending') return 0;
    if (order.status === 'preparing') return 1;
    if (order.status === 'ready' || order.status === 'served' || order.status === 'completed') return 2;
    return 0;
  };

  // Determine payment label & badge
  const isCash = order.customerNotes?.includes('Cash') || order.paymentStatus === 'unpaid';
  const isCard = order.customerNotes?.includes('Card');
  const isEasypaisa = order.customerNotes?.includes('Easypaisa');
  const isJazzCash = order.customerNotes?.includes('JazzCash');

  return (
    <div className={`bg-white p-4 rounded-3xl border border-orange-200/90 shadow-md shadow-orange-500/5 space-y-3 ${className}`}>
      {/* Top Header Row */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
          <span className="font-extrabold text-xs text-orange-600 flex items-center gap-1">
            <FireOutlined /> Live Kitchen Status
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <Tag color="orange" className="!font-mono !font-black !rounded-lg !text-xs !m-0">
            {order.orderNumber}
          </Tag>
          {isCash && (
            <Tag color="warning" className="!font-bold !text-[11px] !rounded-lg !m-0">
              💵 Cash on Delivery
            </Tag>
          )}
          {isCard && (
            <Tag color="processing" className="!font-bold !text-[11px] !rounded-lg !m-0">
              💳 Card Verified
            </Tag>
          )}
          {isEasypaisa && (
            <Tag color="success" className="!font-bold !text-[11px] !rounded-lg !m-0">
              🟢 Easypaisa Paid
            </Tag>
          )}
          {isJazzCash && (
            <Tag color="error" className="!font-bold !text-[11px] !rounded-lg !m-0">
              🔴 JazzCash Paid
            </Tag>
          )}
        </div>
      </div>

      {/* 3-Step Kitchen Preparation Line */}
      <Steps
        size="small"
        current={getStepStatus()}
        items={[
          { title: 'Sent', icon: <ClockCircleOutlined /> },
          { title: 'Cooking', icon: <FireOutlined className="text-orange-500" /> },
          { title: 'Ready', icon: <CheckCircleOutlined className="text-emerald-500" /> },
        ]}
      />

      {/* Contextual Status Subtitle */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-[11px] text-slate-600 font-medium !m-0">
          Kitchen is preparing {order.items.length} {order.items.length === 1 ? 'dish' : 'dishes'} for Table {tableNumber}.
        </p>
        {onCallWaiter && (
          <Button
            size="small"
            icon={<BellOutlined />}
            onClick={onCallWaiter}
            className="!rounded-xl !bg-orange-50 hover:!bg-orange-100 !border-orange-200 !text-orange-700 !font-bold !text-[11px] !h-7 !px-2.5"
          >
            Call Waiter
          </Button>
        )}
      </div>
    </div>
  );
}
