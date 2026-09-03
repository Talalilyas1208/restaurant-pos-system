'use client';

import React from 'react';
import { Button } from 'antd';
import { Utensils } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  title = 'No items found',
  description = 'There are currently no records to display.',
  icon = <Utensils className="w-10 h-10 text-slate-300" />,
  actionText,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`p-8 text-center flex flex-col items-center justify-center space-y-3 bg-white border border-slate-200/90 rounded-3xl shadow-xs ${className}`}
    >
      <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="font-black text-base text-slate-900">{title}</h3>
        <p className="text-xs font-semibold text-slate-500 max-w-sm">{description}</p>
      </div>
      {actionText && onAction && (
        <Button
          type="primary"
          onClick={onAction}
          className="!h-10 !px-5 !rounded-xl !bg-gradient-to-r !from-orange-500 !to-amber-500 hover:!from-orange-600 !font-bold !text-xs border-0 text-white shadow-sm"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}
