'use client';

import React from 'react';
import { Input, Button, Segmented } from 'antd';
import { SearchOutlined, BellOutlined } from '@ant-design/icons';
import { Utensils } from 'lucide-react';
import { Hotel, DiningTable } from '../../types';

interface MenuHeaderProps {
  hotel?: Hotel | null;
  table?: DiningTable | null;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  dietaryFilter: string;
  onDietaryChange: (val: string) => void;
  onCallWaiter: () => void;
}

export default function MenuHeader({
  hotel,
  table,
  searchQuery,
  onSearchChange,
  dietaryFilter,
  onDietaryChange,
  onCallWaiter,
}: MenuHeaderProps) {
  return (
    <div className="bg-white/95 backdrop-blur sticky top-0 z-30 border-b border-slate-200/80 p-3.5 sm:p-4 shadow-xs space-y-3">
      {/* Hotel & Table Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 flex-shrink-0">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-base text-slate-900 leading-tight">
              {hotel?.name || 'POS Project Dining'}
            </h1>
            <p className="text-[11px] font-semibold text-orange-600 flex items-center gap-1">
              <span>Digital Contactless Dining</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="small"
            icon={<BellOutlined />}
            onClick={onCallWaiter}
            className="!rounded-xl !bg-orange-50 hover:!bg-orange-100 !border-orange-200 !text-orange-700 !font-bold !text-xs !h-8"
          >
            Call Waiter
          </Button>
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-xs whitespace-nowrap">
            Table {table?.tableNumber || 'T-01'}
          </div>
        </div>
      </div>

      {/* Search Input */}
      <Input
        prefix={<SearchOutlined className="text-slate-400 mr-1" />}
        placeholder="Search dishes, drinks, ingredients..."
        allowClear
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="!bg-slate-100 !border-slate-200 !rounded-2xl !py-2 !text-slate-800 font-medium placeholder:!text-slate-400 focus:!bg-white"
      />

      {/* Dietary Tags */}
      <div className="overflow-x-auto no-scrollbar pt-0.5">
        <Segmented
          block
          size="middle"
          value={dietaryFilter}
          onChange={(val) => onDietaryChange(val as string)}
          options={[
            { label: 'All 🍽️', value: 'all' },
            { label: 'Veg 🥗', value: 'veg' },
            { label: 'Spicy 🌶️', value: 'spicy' },
            { label: 'Chef Special ⭐', value: 'special' },
          ]}
          className="!bg-slate-100 !p-1 !rounded-2xl !font-semibold text-xs text-slate-700"
        />
      </div>
    </div>
  );
}

