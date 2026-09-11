'use client';

import React from 'react';
import { Tag } from 'antd';
import { WifiOutlined } from '@ant-design/icons';

interface TerminalStatusCardProps {
  amount: number;
  currencySymbol?: string;
}

export default function TerminalStatusCard({
  amount,
  currencySymbol = '$',
}: TerminalStatusCardProps) {
  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50/60 to-slate-50 text-slate-800 shadow-sm border border-blue-200/80 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <span className="font-bold text-xs text-slate-800">Terminal #01 (Ingenico Desk/5000)</span>
        </div>
        <Tag color="success" className="!m-0 !text-[11px] !font-bold !rounded-md">
          READY FOR TAP
        </Tag>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-slate-500 font-semibold !m-0">Amount to Charge</p>
          <div className="text-2xl font-black text-orange-600">
            {currencySymbol}{amount.toFixed(2)}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-slate-500 font-semibold !m-0">Supported Methods</p>
          <span className="text-[11px] font-bold text-slate-700">
            Visa, MC, Apple Pay, NFC
          </span>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-blue-200/60 flex items-center gap-2 text-[11px] text-slate-600 font-medium">
        <WifiOutlined className="text-orange-500 animate-pulse" />
        <span>Instruct customer to tap, insert chip, or swipe card on the terminal.</span>
      </div>
    </div>
  );
}
