'use client';

import React, { useState } from 'react';
import { Space, Button, message, Popconfirm } from 'antd';
import { ThunderboltOutlined, ClearOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { DiningTable } from '../../types';
import { DiningTableCard, StatusBadge, EmptyState } from '../ui';
import { api } from '../../lib/api';

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
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleCreateOnDemand = async () => {
    try {
      setIsGenerating(true);
      const newOrder = await api.createMockOrder();
      message.success(`⚡ On-demand order ${newOrder.orderNumber} created for Table ${newOrder.tableNumber || 'Guest'}!`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tables'] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['analytics'] }),
      ]);
    } catch (err: any) {
      message.error(err?.message || 'Failed to create on-demand order');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearOrders = async () => {
    try {
      setIsClearing(true);
      await api.clearAllOrders();
      message.success('All active orders cleared & all 10 tables reset to Available!');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tables'] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['analytics'] }),
      ]);
    } catch (err: any) {
      message.error(err?.message || 'Failed to clear orders');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-black text-base text-slate-900">Dining Tables ({tables.length})</h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {tables.filter((t) => t.status === 'available').length} Available
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500">Real-time floor occupancy with on-demand ordering</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Space size="small">
            <StatusBadge status="available" size="small" />
            <StatusBadge status="occupied" size="small" />
            <StatusBadge status="billed" size="small" />
          </Space>

          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            loading={isGenerating}
            onClick={handleCreateOnDemand}
            className="!rounded-xl !font-bold !bg-orange-500 hover:!bg-orange-600"
          >
            On-Demand Order
          </Button>

          <Popconfirm
            title="Clear all active orders?"
            description="This will reset all tables to available."
            onConfirm={handleClearOrders}
            okText="Clear"
            cancelText="Cancel"
          >
            <Button
              danger
              icon={<ClearOutlined />}
              loading={isClearing}
              className="!rounded-xl !font-bold"
            >
              Clear
            </Button>
          </Popconfirm>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
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
