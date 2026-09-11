'use client';

import React from 'react';
import { Input } from 'antd';
import {
  CreditCardOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { CardPaymentData } from './CardTerminalPayment';

interface ManualCardEntryFormProps {
  value: CardPaymentData;
  onUpdateField: (field: keyof CardPaymentData, val: string) => void;
  onCardNumberChange: (raw: string) => void;
}

export default function ManualCardEntryForm({
  value,
  onUpdateField,
  onCardNumberChange,
}: ManualCardEntryFormProps) {
  return (
    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">Cardholder Full Name</label>
        <Input
          size="large"
          placeholder="e.g. Jonathan Doe"
          value={value.cardholderName || ''}
          onChange={(e) => onUpdateField('cardholderName', e.target.value)}
          prefix={<UserOutlined className="text-slate-400" />}
          className="!rounded-xl font-bold"
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">
          Card Number <span className="text-slate-400 font-normal">({value.cardBrand || 'Card'})</span>
        </label>
        <Input
          size="large"
          placeholder="4532 •••• •••• 8921"
          maxLength={19}
          onChange={(e) => onCardNumberChange(e.target.value)}
          prefix={<CreditCardOutlined className="text-orange-500" />}
          className="!rounded-xl font-mono font-bold"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Expiration (MM/YY)</label>
          <Input
            size="large"
            maxLength={5}
            placeholder="MM/YY"
            value={value.expiryDate || ''}
            onChange={(e) => {
              let v = e.target.value.replace(/\D/g, '').slice(0, 4);
              if (v.length >= 3) v = `${v.slice(0, 2)}/${v.slice(2)}`;
              onUpdateField('expiryDate', v);
            }}
            className="!rounded-xl font-mono font-bold text-center"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">CVV / Security Code</label>
          <Input
            size="large"
            maxLength={4}
            placeholder="CVC"
            className="!rounded-xl font-mono font-bold text-center"
            prefix={<SafetyCertificateOutlined className="text-slate-400" />}
          />
        </div>
      </div>
    </div>
  );
}
