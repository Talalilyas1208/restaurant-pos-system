'use client';

import React from 'react';
import { Tag, Button, Segmented, Switch } from 'antd';
import { ReloadOutlined, SoundOutlined } from '@ant-design/icons';
import { ChefHat, Moon, Sun } from 'lucide-react';
import { PageHeader } from '../ui';

interface KDSHeaderProps {
  activeCount: number;
  filterType: string;
  onFilterChange: (val: string) => void;
  isFetching: boolean;
  onRefetch: () => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  isDark?: boolean;
  onToggleDark?: (dark: boolean) => void;
}

export default function KDSHeader({
  activeCount,
  filterType,
  onFilterChange,
  isFetching,
  onRefetch,
  soundEnabled,
  onToggleSound,
  isDark = false,
  onToggleDark,
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
            className={`p-1 !rounded-2xl border font-bold ${
              isDark
                ? '!bg-slate-800 !border-slate-700 text-slate-200'
                : '!bg-slate-100 !border-slate-200 text-slate-700'
            }`}
          />

          <Button
            shape="circle"
            icon={<ReloadOutlined spin={isFetching} />}
            onClick={onRefetch}
            className={`font-bold ${
              isDark
                ? '!bg-slate-800 !border-slate-700 !text-slate-200'
                : '!bg-white !border-slate-200 !text-slate-700'
            }`}
          />

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-bold shadow-xs ${
            isDark
              ? 'bg-slate-800 border-slate-700 text-slate-200'
              : 'bg-white border-slate-200 text-slate-700'
          }`}>
            <SoundOutlined className={soundEnabled ? 'text-emerald-500' : 'text-slate-400'} />
            <span className="text-[11px] hidden sm:inline">Audio</span>
            <Switch size="small" checked={soundEnabled} onChange={onToggleSound} />
          </div>

          {onToggleDark && (
            <button
              onClick={() => onToggleDark(!isDark)}
              className={`p-2 rounded-2xl border flex items-center justify-center transition-colors ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Kitchen Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
        </div>
      }
    />
  );
}
