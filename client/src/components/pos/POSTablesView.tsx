'use client';

import React from 'react';
import { Space } from 'antd';
import { DiningTable } from '../../types';
import { DiningTableCard, StatusBadge, EmptyState } from '../ui';

interface POSTablesViewProps {
  tables: DiningTable[];
  selectedTableId?: string | null;
  onSelectTable: (tbl: DiningTable) => void;
}

export default function POSTablesView({
  tables,
  selectedTableId,
  onSelectTable,
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

      {tables.length === 0 ? (
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

