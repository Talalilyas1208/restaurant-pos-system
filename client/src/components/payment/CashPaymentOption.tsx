'use client';

import React from 'react';

interface CashPaymentOptionProps {
  amount: number;
  currencySymbol?: string;
}

export default function CashPaymentOption({
  amount,
  currencySymbol = '$',
}: CashPaymentOptionProps) {
  return (
    <div className="bg-amber-50/80 border border-amber-200 p-3.5 rounded-2xl space-y-2">
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-black text-sm">
          💵
        </span>
        <div>
          <h4 className="font-extrabold text-sm text-amber-950">Pay Cash at Counter or Table</h4>
          <p className="text-[11px] text-slate-600 font-medium">Order goes straight to the kitchen</p>
        </div>
      </div>
      <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200/80 text-xs text-slate-700 leading-relaxed font-medium">
        Order is placed immediately. Please pay{' '}
        <span className="font-black text-orange-600">
          {currencySymbol}{amount.toFixed(2)}
        </span>{' '}
        with cash directly when the food is served or at the cashier counter.
      </div>
    </div>
  );
}

