'use client';

import React from 'react';
import { Tag, Button, Segmented, Switch } from 'antd';
import { ReloadOutlined, SoundOutlined } from '@ant-design/icons';
import { ChefHat } from 'lucide-react';
import { PageHeader } from '../ui';

interface KDSHeaderProps {
  activeCount: number;
  filterType: string;
  onFilterChange: (val: string) => void;
  isFetching: boolean;
  onRefetch: () => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
}

export default function KDSHeader({
  activeCount,
  filterType,
  onFilterChange,
  isFetching,
  onRefetch,
  soundEnabled,
  onToggleSound,
}: KDSHeaderProps) {
  return (
    <PageHeader
      title="Kitchen Display System (KDS)"
      subtitle="Live kitchen tickets, order modifiers, prep timers & station routing"
      icon={<ChefHat className="w-5 h-5" />}
      badge={
        <Tag color="orange" className="!font-black !rounded-md">
          {activeCount} Active Tickets
        </Tag>
      }
      actions={
        <div className="flex items-center gap-3">
          <Segmented
            size="middle"
            value={filterType}
            onChange={(val) => onFilterChange(val as string)}
            options={[
              { label: 'All Orders', value: 'all' },
              { label: 'Dine In', value: 'dine_in' },
              { label: 'Room Service', value: 'room_service' },
              { label: 'Takeaway', value: 'takeaway' },
            ]}
            className="!bg-slate-100 !p-1 !rounded-2xl !border !border-slate-200 font-bold text-slate-700"
          />

          <Button
            shape="circle"
            icon={<ReloadOutlined spin={isFetching} />}
            onClick={onRefetch}
            className="!bg-white !border-slate-200 !text-slate-700 font-bold"
          />

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs">
            <SoundOutlined className={soundEnabled ? 'text-emerald-600' : 'text-slate-400'} />
            <span className="text-[11px] hidden sm:inline">Audio</span>
            <Switch
              size="small"
              checked={soundEnabled}
              onChange={onToggleSound}
            />
          </div>
        </div>
      }
    />
  );
}
