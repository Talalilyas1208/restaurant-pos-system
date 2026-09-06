'use client';

import React from 'react';
import { Segmented, Input, Tooltip, Tag, Badge } from 'antd';
import {
  AppstoreOutlined,
  TableOutlined,
  ShoppingCartOutlined,
  SearchOutlined,
  WifiOutlined,
  DisconnectOutlined,
} from '@ant-design/icons';

interface POSTopBarProps {
  activeTab: 'menu' | 'tables' | 'cart';
  onTabChange: (tab: 'menu' | 'tables' | 'cart') => void;
  tableNumber?: string | null;
  totalCartQty: number;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  isOnline: boolean;
}

export default function POSTopBar({
  activeTab,
  onTabChange,
  tableNumber,
  totalCartQty,
  searchQuery,
  onSearchChange,
  isOnline,
}: POSTopBarProps) {
  return (
    <div className="p-3 md:p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-2">
        <Segmented
          size="large"
          value={activeTab}
          onChange={(val) => onTabChange(val as 'menu' | 'tables' | 'cart')}
          options={[
            { label: 'Food Menu', value: 'menu', icon: <AppstoreOutlined /> },
            {
              label: (
                <span className="flex items-center gap-1.5">
                  <span>Floor Tables</span>
                  {tableNumber && (
                    <Tag color="orange" className="!m-0 !font-black !text-[11px] !rounded-md">
                      {tableNumber}
                    </Tag>
                  )}
                </span>
              ),
              value: 'tables',
              icon: <TableOutlined />,
            },
            {
              label: (
                <span className="lg:hidden flex items-center gap-1.5">
                  <span>Cart</span>
                  {totalCartQty > 0 && <Badge count={totalCartQty} size="small" />}
                </span>
              ),
              value: 'cart',
              icon: <ShoppingCartOutlined className="lg:hidden" />,
            },
          ]}
          className="!bg-slate-100 !p-1 !rounded-2xl !border !border-slate-200 !font-bold text-slate-700"
        />
      </div>

      {activeTab === 'menu' && (
        <div className="flex-1 min-w-[200px] max-w-md">
          <Input
            placeholder="Search dishes..."
            prefix={<SearchOutlined className="text-slate-400 mr-1.5" />}
            allowClear
            size="large"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="!bg-slate-100 !border-slate-200 !rounded-2xl !text-slate-800 focus:!bg-white"
          />
        </div>
      )}

      {/* Connectivity Indicator */}
      <Tooltip title={isOnline ? 'Connected to server' : 'Offline — showing cached data'}>
        <div
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border ${
            isOnline
              ? 'text-emerald-700 border-emerald-200 bg-emerald-50'
              : 'text-rose-700 border-rose-200 bg-rose-50'
          }`}
        >
          {isOnline ? <WifiOutlined /> : <DisconnectOutlined />}
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </Tooltip>
    </div>
  );
}
