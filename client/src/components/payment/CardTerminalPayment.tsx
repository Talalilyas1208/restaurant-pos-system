'use client';

import React, { useState } from 'react';
import { Input, Segmented, Tag, Tooltip } from 'antd';
import {
  CreditCardOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  WifiOutlined,
  KeyOutlined,
  UserOutlined,
  BarcodeOutlined,
} from '@ant-design/icons';

export interface CardPaymentData {
  mode: 'terminal' | 'manual';
  cardBrand: string;
  cardLast4: string;
  authCode: string;
  transactionRef: string;
  cardholderName?: string;
  expiryDate?: string;
}

interface CardTerminalPaymentProps {
  amount: number;
  currencySymbol?: string;
  value: CardPaymentData;
  onChange: (data: CardPaymentData) => void;
}

export default function CardTerminalPayment({
  amount,
  currencySymbol = '$',
  value,
  onChange,
}: CardTerminalPaymentProps) {
  const [activeMode, setActiveMode] = useState<'terminal' | 'manual'>(value.mode || 'terminal');

  const updateField = (field: keyof CardPaymentData, val: string) => {
    onChange({
      ...value,
      mode: activeMode,
      [field]: val,
    });
  };

  const handleModeChange = (mode: 'terminal' | 'manual') => {
    setActiveMode(mode);
    onChange({
      ...value,
      mode,
    });
  };

  // Card brand detection helper
  const detectBrand = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(clean)) return 'Mastercard';
    if (/^3[47]/.test(clean)) return 'Amex';
    if (/^6(?:011|5)/.test(clean)) return 'Discover';
    return 'Credit Card';
  };

  const handleCardNumberChange = (raw: string) => {
    const digitsOnly = raw.replace(/\D/g, '').slice(0, 16);
    const formatted = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
    const last4 = digitsOnly.slice(-4);
    const brand = detectBrand(digitsOnly);

    onChange({
      ...value,
      mode: activeMode,
      cardBrand: brand,
      cardLast4: last4,
    });
  };

  return (
    <div className="space-y-4">
      {/* Mode Segmented Switch */}
      <Segmented
        block
        value={activeMode}
        onChange={(val) => handleModeChange(val as 'terminal' | 'manual')}
        options={[
          {
            label: (
              <div className="flex items-center justify-center gap-1.5 py-1">
                <WifiOutlined className="text-orange-500" />
                <span>POS PIN Pad / NFC Tap</span>
              </div>
            ),
            value: 'terminal',
          },
          {
            label: (
              <div className="flex items-center justify-center gap-1.5 py-1">
                <KeyOutlined className="text-blue-500" />
                <span>Manual Card Entry</span>
              </div>
            ),
            value: 'manual',
          },
        ]}
        className="!bg-slate-100 !p-1 !rounded-2xl !border !border-slate-200 font-bold"
      />

      {/* OPTION 1: PHYSICAL POS TERMINAL (EMV / CHIP / NFC TAP) */}
      {activeMode === 'terminal' ? (
        <div className="space-y-3">
          {/* Terminal Live Status Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md border border-slate-700 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <span className="font-bold text-xs text-slate-200">Terminal #01 (Ingenico Desk/5000)</span>
              </div>
              <Tag color="success" className="!m-0 !text-[11px] !font-bold !rounded-md">
                READY FOR TAP
              </Tag>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 !m-0">Amount to Charge</p>
                <div className="text-2xl font-black text-amber-400">
                  {currencySymbol}{amount.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-400 !m-0">Supported Methods</p>
                <span className="text-[11px] font-bold text-slate-300">
                  Visa, MC, Apple Pay, NFC
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-700/80 flex items-center gap-2 text-[11px] text-slate-300">
              <WifiOutlined className="text-amber-400 animate-pulse" />
              <span>Instruct customer to tap, insert chip, or swipe card on the terminal.</span>
            </div>
          </div>

          {/* Terminal Transaction Confirmation Fields */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Card Brand</label>
              <Input
                size="middle"
                value={value.cardBrand || 'Visa'}
                onChange={(e) => updateField('cardBrand', e.target.value)}
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
                onChange={(e) => updateField('cardLast4', e.target.value.replace(/\D/g, ''))}
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
                onChange={(e) => updateField('authCode', e.target.value)}
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
                onChange={(e) => updateField('transactionRef', e.target.value)}
                placeholder="Ref #89421"
                className="!rounded-xl font-mono text-xs font-bold"
                prefix={<BarcodeOutlined className="text-slate-400" />}
              />
            </div>
          </div>
        </div>
      ) : (
        /* OPTION 2: MANUAL KEYED CARD ENTRY */
        <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Cardholder Full Name</label>
            <Input
              size="large"
              placeholder="e.g. Jonathan Doe"
              value={value.cardholderName || ''}
              onChange={(e) => updateField('cardholderName', e.target.value)}
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
              onChange={(e) => handleCardNumberChange(e.target.value)}
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
                  updateField('expiryDate', v);
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
      )}
    </div>
  );
}

