'use client';

import React, { useState } from 'react';
import { Segmented } from 'antd';
import { WifiOutlined, KeyOutlined } from '@ant-design/icons';
import TerminalStatusCard from './TerminalStatusCard';
import TerminalFieldsGrid from './TerminalFieldsGrid';
import ManualCardEntryForm from './ManualCardEntryForm';

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

      {activeMode === 'terminal' ? (
        <div className="space-y-3">
          <TerminalStatusCard amount={amount} currencySymbol={currencySymbol} />
          <TerminalFieldsGrid value={value} onUpdateField={updateField} />
        </div>
      ) : (
        <ManualCardEntryForm
          value={value}
          onUpdateField={updateField}
          onCardNumberChange={handleCardNumberChange}
        />
      )}
    </div>
  );
}
