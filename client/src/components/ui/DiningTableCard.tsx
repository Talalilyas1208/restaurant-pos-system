'use client';

import React from 'react';
import { Tag } from 'antd';
import { DiningTable } from '../../types';
import StatusBadge from './StatusBadge';

interface DiningTableCardProps {
  table: DiningTable;
  onSelect?: (table: DiningTable) => void;
  isSelected?: boolean;
  className?: string;
  showActions?: boolean;
}

export default function DiningTableCard({
  table,
  onSelect,
  isSelected = false,
  className = '',
}: DiningTableCardProps) {
  let statusTheme = 'bg-white border-slate-200 hover:border-slate-300 text-slate-800';

  if (table.status === 'available') {
    statusTheme = 'bg-emerald-50/50 border-emerald-200/90 hover:border-emerald-400 text-emerald-950';
  } else if (table.status === 'occupied') {
    statusTheme = 'bg-orange-50/50 border-orange-200/90 hover:border-orange-400 text-orange-950';
  } else if (table.status === 'reserved') {
    statusTheme = 'bg-blue-50/50 border-blue-200/90 hover:border-blue-400 text-blue-950';
  }

  return (
    <div
      onClick={() => onSelect && onSelect(table)}
      className={`p-4 sm:p-5 rounded-3xl border-2 flex flex-col items-center text-center space-y-2.5 transition-all duration-200 select-none shadow-sm ${
        onSelect ? 'cursor-pointer hover:scale-102 hover:shadow-md' : ''
      } ${statusTheme} ${
        isSelected ? '!ring-4 !ring-orange-500 !border-orange-500 !shadow-lg scale-102' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between w-full">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          {table.section}
        </span>
        <StatusBadge status={table.status} size="small" showPulse={table.status === 'occupied'} />
      </div>

      <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 py-1">
        {table.tableNumber}
      </div>

      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white/70 px-3 py-1 rounded-xl border border-slate-200/60 shadow-2xs">
        <span>👥 {table.capacity} Seats</span>
      </div>
    </div>
  );
}

