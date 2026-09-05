'use client';

import React from 'react';
import { Segmented } from 'antd';
import { DollarOutlined, CreditCardOutlined } from '@ant-design/icons';
import CashPaymentOption from './CashPaymentOption';
import CardPaymentForm, { CardState } from './CardPaymentForm';
import MobileWalletPayment, { MobileWalletState } from './MobileWalletPayment';

export type { CardState, MobileWalletState };

export interface PaymentMethodSelectorProps {
  amount: number;
  currencySymbol?: string;
  hotelName?: string;
  tableNumber?: string;
  paymentMethod: 'cash' | 'credit_card' | 'easypaisa' | 'jazzcash';
  onMethodChange: (val: 'cash' | 'credit_card' | 'easypaisa' | 'jazzcash') => void;
  cardState: CardState;
  onCardChange: (state: CardState) => void;
  easypaisaState: MobileWalletState;
  onEasypaisaChange: (state: MobileWalletState) => void;
  jazzcashState: MobileWalletState;
  onJazzcashChange: (state: MobileWalletState) => void;
}

export default function PaymentMethodSelector({
  amount,
  currencySymbol = '$',
  hotelName = 'Grand Palace Hotel & Dining',
  tableNumber = 'T-01',
  paymentMethod,
  onMethodChange,
  cardState,
  onCardChange,
  easypaisaState,
  onEasypaisaChange,
  jazzcashState,
  onJazzcashChange,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 block uppercase tracking-wide">
          Payment Method
        </span>
        <span className="text-[11px] font-semibold text-orange-600">
          {paymentMethod === 'cash' ? 'Pay upon service' : 'Instant Online Pay'}
        </span>
      </div>

      {/* 4-Option Segmented Selector */}
      <Segmented
        block
        size="large"
        value={paymentMethod}
        onChange={(val) => onMethodChange(val as any)}
        options={[
          {
            label: (
              <div className="flex items-center justify-center gap-1 text-xs font-bold py-0.5">
                <DollarOutlined className="text-emerald-600" />
                <span>Cash</span>
              </div>
            ),
            value: 'cash',
          },
          {
            label: (
              <div className="flex items-center justify-center gap-1 text-xs font-bold py-0.5">
                <CreditCardOutlined className="text-blue-600" />
                <span>Card</span>
              </div>
            ),
            value: 'credit_card',
          },
          {
            label: (
              <div className="flex items-center justify-center gap-1 text-xs font-bold py-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Easypaisa</span>
              </div>
            ),
            value: 'easypaisa',
          },
          {
            label: (
              <div className="flex items-center justify-center gap-1 text-xs font-bold py-0.5">
                <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
                <span>JazzCash</span>
              </div>
            ),
            value: 'jazzcash',
          },
        ]}
        className="!bg-slate-100 !p-1.5 !rounded-2xl !border !border-slate-200"
      />

      {/* 1. Cash Payment Box */}
      {paymentMethod === 'cash' && (
        <CashPaymentOption amount={amount} currencySymbol={currencySymbol} />
      )}

      {/* 2. Credit / Debit Card Box */}
      {paymentMethod === 'credit_card' && (
        <CardPaymentForm cardState={cardState} onCardChange={onCardChange} />
      )}

      {/* 3. Easypaisa Box */}
      {paymentMethod === 'easypaisa' && (
        <MobileWalletPayment
          walletType="easypaisa"
          amount={amount}
          currencySymbol={currencySymbol}
          hotelName={hotelName}
          tableNumber={tableNumber}
          walletState={easypaisaState}
          onWalletChange={onEasypaisaChange}
        />
      )}

      {/* 4. JazzCash Box */}
      {paymentMethod === 'jazzcash' && (
        <MobileWalletPayment
          walletType="jazzcash"
          amount={amount}
          currencySymbol={currencySymbol}
          hotelName={hotelName}
          tableNumber={tableNumber}
          walletState={jazzcashState}
          onWalletChange={onJazzcashChange}
        />
      )}
    </div>
  );
}
