'use client';

import React from 'react';
import { Button, Space, Divider } from 'antd';
import { SplitCellsOutlined, CreditCardOutlined } from '@ant-design/icons';

interface POSTicketSummaryProps {
  subtotal: number;
  taxRate: number;
  tax: number;
  serviceChargeRate: number;
  serviceCharge: number;
  discountPercent: number;
  discountAmount: number;
  grandTotal: number;
  onSetDiscount: (percent: number) => void;
  onOpenSplitModal: () => void;
  onCheckout: () => void;
}

export default function POSTicketSummary({
  subtotal,
  taxRate,
  tax,
  serviceChargeRate,
  serviceCharge,
  discountPercent,
  discountAmount,
  grandTotal,
  onSetDiscount,
  onOpenSplitModal,
  onCheckout,
}: POSTicketSummaryProps) {
  return (
    <div className="p-4 border-t border-slate-200 bg-white space-y-3 shadow-lg">
      <div className="space-y-1.5 text-xs text-slate-600 font-semibold">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax ({taxRate}%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Service Charge ({serviceChargeRate}%)</span>
          <span>${serviceCharge.toFixed(2)}</span>
        </div>

        {/* Discount Selectors */}
        <div className="flex items-center justify-between pt-1">
          <span>Discount ({discountPercent}%)</span>
          <Space size={4}>
            {[0, 5, 10, 15].map((d) => (
              <Button
                key={d}
                size="small"
                type={discountPercent === d ? 'primary' : 'default'}
                onClick={() => onSetDiscount(d)}
                className="!text-[10px] !h-6 !px-2 !rounded-md !font-bold"
              >
                {d}%
              </Button>
            ))}
            {discountAmount > 0 && (
              <span className="text-emerald-600 font-bold ml-1">-${discountAmount.toFixed(2)}</span>
            )}
          </Space>
        </div>

        <Divider className="!border-slate-200 !my-2" />

        <div className="flex items-center justify-between text-base font-bold text-slate-900">
          <span>Total Amount Due</span>
          <span className="text-orange-600 text-2xl font-black">${grandTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1">
        <Button
          icon={<SplitCellsOutlined />}
          onClick={onOpenSplitModal}
          className="!h-12 !rounded-2xl !bg-slate-100 hover:!bg-slate-200 !border-slate-200 !text-slate-800 !text-xs !font-bold"
        >
          Split Bill
        </Button>
        <Button
          type="primary"
          size="large"
          icon={<CreditCardOutlined />}
          onClick={onCheckout}
          className="col-span-2 !h-12 !rounded-2xl !bg-gradient-to-r !from-orange-500 via-rose-500 to-amber-500 hover:!opacity-95 !font-black !text-sm !shadow-lg !shadow-orange-500/25 flex items-center justify-between border-0 text-white"
        >
          <span>Checkout & Pay</span>
          <span>${grandTotal.toFixed(2)}</span>
        </Button>
      </div>
    </div>
  );
}
