'use client';

import React from 'react';
import { Tag } from 'antd';

interface SidebarFooterProps {
  isOnline: boolean;
  collapsed?: boolean;
}

export default function SidebarFooter({ isOnline, collapsed = false }: SidebarFooterProps) {
  return (
    <div className="p-3 border-t border-slate-100 space-y-2">
      <div
        className={`flex items-center gap-2 p-2 rounded-2xl border text-xs font-bold ${
          isOnline
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : 'border-rose-200 bg-rose-50 text-rose-800'
        } ${collapsed ? 'justify-center' : 'justify-between'}`}
      >
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full animate-ping ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          {!collapsed && <span>{isOnline ? 'System Online' : 'Offline'}</span>}
        </div>
        {!collapsed && (
          <Tag color={isOnline ? 'success' : 'error'} className="!m-0 !text-[10px] !font-black !rounded-md">
            LIVE
          </Tag>
        )}
      </div>

      {!collapsed && (
        <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center font-black text-orange-600 text-xs flex-shrink-0">
              T1
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-black text-slate-900 block truncate">Station Terminal #1</span>
              <span className="text-[10px] font-semibold text-slate-500 block truncate">Ready for Orders</span>
            </div>
          </div>
          <Tag color="orange" className="!m-0 !font-mono !font-black text-[10px] !rounded-md">
            POS
          </Tag>
        </div>
      )}
    </div>
  );
}
