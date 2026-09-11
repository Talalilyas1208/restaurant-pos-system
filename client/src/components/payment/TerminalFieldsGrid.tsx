'use client';

import React from 'react';
import { Input } from 'antd';
import {
  CreditCardOutlined,
  SafetyCertificateOutlined,
  BarcodeOutlined,
} from '@ant-design/icons';
import { CardPaymentData } from './CardTerminalPayment';

interface TerminalFieldsGridProps {
  value: CardPaymentData;
  onUpdateField: (field: keyof CardPaymentData, val: string) => void;
}

export default function TerminalFieldsGrid({
  value,
  onUpdateField,
}: TerminalFieldsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
      <div>
        <label className="text-[11px] font-bold text-slate-700 block mb-1">Card Brand</label>
        <Input
          size="middle"
          value={value.cardBrand || 'Visa'}
          onChange={(e) => onUpdateField('cardBrand', e.target.value)}
          placeholder="Visa, Mastercard..."
          className="!rounded-xl font-bold"
          prefix={<CreditCardOutlined className="text-slate-400" />}
        />
      </div>
      <div>
        <label className="text-[11px] font-bold text-slate-700 block mb-1">Last 4 Digits</label>
        <Input
          size="middle"
          maxLength={4}
          value={value.cardLast4}
          onChange={(e) => onUpdateField('cardLast4', e.target.value.replace(/\D/g, ''))}
          placeholder="4242"
          className="!rounded-xl font-mono font-bold"
          prefix={<span className="text-slate-400 text-xs">••••</span>}
        />
      </div>
      <div>
        <label className="text-[11px] font-bold text-slate-700 block mb-1">Auth / Approval Code</label>
        <Input
          size="middle"
          value={value.authCode}
          onChange={(e) => onUpdateField('authCode', e.target.value)}
          placeholder="e.g. AUTH-9821"
          className="!rounded-xl font-mono text-xs font-bold"
          prefix={<SafetyCertificateOutlined className="text-emerald-500" />}
        />
      </div>
      <div>
        <label className="text-[11px] font-bold text-slate-700 block mb-1">Terminal Trace / Ref</label>
        <Input
          size="middle"
          value={value.transactionRef}
          onChange={(e) => onUpdateField('transactionRef', e.target.value)}
          placeholder="Ref #89421"
          className="!rounded-xl font-mono text-xs font-bold"
          prefix={<BarcodeOutlined className="text-slate-400" />}
        />
      </div>
    </div>
  );
}
