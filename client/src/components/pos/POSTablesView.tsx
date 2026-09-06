'use client';

import React from 'react';
import { Space } from 'antd';
import { DiningTable } from '../../types';
import { DiningTableCard, StatusBadge, EmptyState } from '../ui';

interface POSTablesViewProps {
  tables: DiningTable[];
  selectedTableId?: string | null;
  onSelectTable: (tbl: DiningTable) => void;
  isLoading?: boolean;
}

export default function POSTablesView({
  tables,
  selectedTableId,
  onSelectTable,
  isLoading = false,
}: POSTablesViewProps) {
  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-5">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="font-black text-base text-slate-900">Dining Tables & Rooms</h3>
          <p className="text-xs font-semibold text-slate-500">Select a table to assign to current ticket</p>
        </div>
        <Space>
          <StatusBadge status="available" size="small" />
          <StatusBadge status="occupied" size="small" />
          <StatusBadge status="reserved" size="small" />
        </Space>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-36 bg-white rounded-3xl border border-slate-200/80 p-4 animate-pulse space-y-3">
              <div className="h-6 w-16 bg-slate-200 rounded-lg" />
              <div className="h-4 w-24 bg-slate-100 rounded" />
              <div className="h-5 w-20 bg-slate-200 rounded-full" />
            </div>
          ))}
        </div>
      ) : tables.length === 0 ? (
        <EmptyState
          title="No dining tables"
          description="Go to Admin & Tables to create tables."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {tables.map((tbl) => (
            <DiningTableCard
              key={tbl.id}
              table={tbl}
              isSelected={selectedTableId === tbl.id}
              onSelect={onSelectTable}
            />
          ))}
        </div>
      )}
    </div>
  );
}

