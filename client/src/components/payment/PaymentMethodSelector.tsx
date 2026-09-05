'use client';

import React, { useState } from 'react';
import { Segmented, Input, Button, Tag, message } from 'antd';
import {
  DollarOutlined,
  CreditCardOutlined,
  CopyOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';

export interface CardState {
  cardNumber: string;
  cardholderName: string;
  expiry: string;
  cvv: string;
}

export interface MobileWalletState {
  senderMobile: string;
  transactionRef: string;
}

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
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    message.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2500);
  };

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
      )}

      {/* 2. Credit / Debit Card Box */}
      {paymentMethod === 'credit_card' && (
        <div className="bg-blue-50/70 border border-blue-200 p-3.5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-black text-sm">
                💳
              </span>
              <div>
                <h4 className="font-extrabold text-sm text-blue-950">Online Card Payment</h4>
                <p className="text-[11px] text-slate-600 font-medium">Visa, Mastercard, UnionPay, PayPak</p>
              </div>
            </div>
            <Tag color="blue" className="!font-bold !text-[10px] !rounded-md !m-0">
              256-BIT SSL
            </Tag>
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Cardholder Name</label>
              <Input
                placeholder="Name on card (e.g. John Doe)"
                value={cardState.cardholderName}
                onChange={(e) => onCardChange({ ...cardState, cardholderName: e.target.value })}
                className="!bg-white !border-slate-300 !rounded-xl !py-1.5 !text-slate-900 font-semibold"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Card Number</label>
              <Input
                placeholder="4242 •••• •••• 4242"
                maxLength={19}
                value={cardState.cardNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                  const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                  onCardChange({ ...cardState, cardNumber: formatted });
                }}
                className="!bg-white !border-slate-300 !rounded-xl !py-1.5 !text-slate-900 font-mono font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Expiry (MM/YY)</label>
                <Input
                  placeholder="12/28"
                  maxLength={5}
                  value={cardState.expiry}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2);
                    onCardChange({ ...cardState, expiry: val });
                  }}
                  className="!bg-white !border-slate-300 !rounded-xl !py-1.5 !text-slate-900 font-mono font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">CVV / CVC</label>
                <Input.Password
                  placeholder="•••"
                  maxLength={4}
                  value={cardState.cvv}
                  onChange={(e) => onCardChange({ ...cardState, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  className="!bg-white !border-slate-300 !rounded-xl !py-1.5 !text-slate-900 font-mono font-bold text-center"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Easypaisa Payment Box */}
      {paymentMethod === 'easypaisa' && (
        <div className="bg-emerald-50/80 border-2 border-emerald-400/70 p-3.5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-xs shadow-sm shadow-emerald-600/30">
                EP
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-emerald-950">Easypaisa Mobile Wallet</h4>
                <p className="text-[11px] text-emerald-800 font-semibold">Telenor Microfinance Bank</p>
              </div>
            </div>
            <Tag color="success" className="!font-bold !text-[10px] !rounded-md !m-0">
              ACTIVE TILL
            </Tag>
          </div>

          {/* Merchant Account Details & Copy */}
          <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Merchant Till / Mobile</span>
                <span className="text-base font-black text-emerald-700 font-mono">0312-9876543</span>
              </div>
              <Button
                size="small"
                icon={copiedField === 'easypaisa' ? <CheckOutlined className="text-emerald-600" /> : <CopyOutlined />}
                onClick={() => copyToClipboard('03129876543', 'easypaisa')}
                className="!rounded-lg !text-xs !font-bold !bg-emerald-50 !border-emerald-300 !text-emerald-800"
              >
                {copiedField === 'easypaisa' ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <div className="flex items-center justify-between text-[11px] border-t border-slate-100 pt-1.5">
              <span className="text-slate-500 font-medium">Account Title:</span>
              <span className="font-bold text-slate-800">{hotelName}</span>
            </div>
          </div>

          {/* Dynamic QR Code */}
          <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-emerald-200">
            <div className="bg-white p-1 rounded-lg border border-slate-200 flex-shrink-0">
              <QRCodeSVG
                value={`easypaisa://pay?account=03129876543&amount=${amount.toFixed(2)}&ref=${tableNumber}`}
                size={88}
                level="M"
              />
            </div>
            <div className="space-y-1 text-xs">
              <span className="font-black text-slate-800 block text-xs">Scan & Pay via Easypaisa App</span>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed !m-0">
                Transfer <span className="font-bold text-emerald-700">{currencySymbol}{amount.toFixed(2)}</span> via Easypaisa App or dial *786#, then enter your transaction ID below.
              </p>
            </div>
          </div>

          {/* Customer Inputs */}
          <div className="space-y-2">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Your Easypaisa Mobile Number</label>
              <Input
                placeholder="03XX-XXXXXXX"
                maxLength={11}
                value={easypaisaState.senderMobile}
                onChange={(e) => onEasypaisaChange({ ...easypaisaState, senderMobile: e.target.value })}
                className="!bg-white !border-slate-300 !rounded-xl !py-1.5 !text-slate-900 font-semibold"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">Transaction ID (TID from 3737 SMS)</label>
                <button
                  type="button"
                  onClick={() =>
                    onEasypaisaChange({
                      ...easypaisaState,
                      transactionRef: `EP-${Math.floor(100000 + Math.random() * 900000)}`,
                    })
                  }
                  className="text-[10px] font-bold text-emerald-700 hover:underline"
                >
                  Auto-fill Demo TID
                </button>
              </div>
              <Input
                placeholder="e.g. EP-982314 or 12-digit TID"
                value={easypaisaState.transactionRef}
                onChange={(e) => onEasypaisaChange({ ...easypaisaState, transactionRef: e.target.value })}
                className="!bg-white !border-slate-300 !rounded-xl !py-1.5 !text-slate-900 font-mono font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. JazzCash Payment Box */}
      {paymentMethod === 'jazzcash' && (
        <div className="bg-amber-50/80 border-2 border-amber-400/70 p-3.5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 flex items-center justify-center text-white font-black text-xs shadow-sm">
                JC
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">JazzCash Mobile Wallet</h4>
                <p className="text-[11px] text-amber-800 font-semibold">Mobilink Microfinance Bank</p>
              </div>
            </div>
            <Tag color="warning" className="!font-bold !text-[10px] !rounded-md !m-0">
              ACTIVE TILL
            </Tag>
          </div>

          {/* Merchant Account Details & Copy */}
          <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Merchant Till / Mobile</span>
                <span className="text-base font-black text-red-600 font-mono">0300-1234567</span>
              </div>
              <Button
                size="small"
                icon={copiedField === 'jazzcash' ? <CheckOutlined className="text-emerald-600" /> : <CopyOutlined />}
                onClick={() => copyToClipboard('03001234567', 'jazzcash')}
                className="!rounded-lg !text-xs !font-bold !bg-amber-50 !border-amber-300 !text-amber-900"
              >
                {copiedField === 'jazzcash' ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <div className="flex items-center justify-between text-[11px] border-t border-slate-100 pt-1.5">
              <span className="text-slate-500 font-medium">Account Title:</span>
              <span className="font-bold text-slate-800">{hotelName}</span>
            </div>
          </div>

          {/* Dynamic QR Code */}
          <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-amber-200">
            <div className="bg-white p-1 rounded-lg border border-slate-200 flex-shrink-0">
              <QRCodeSVG
                value={`jazzcash://pay?account=03001234567&amount=${amount.toFixed(2)}&ref=${tableNumber}`}
                size={88}
                level="M"
              />
            </div>
            <div className="space-y-1 text-xs">
              <span className="font-black text-slate-800 block text-xs">Scan & Pay via JazzCash App</span>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed !m-0">
                Transfer <span className="font-bold text-red-600">{currencySymbol}{amount.toFixed(2)}</span> via JazzCash App or dial *786#, then enter your transaction ID below.
              </p>
            </div>
          </div>

          {/* Customer Inputs */}
          <div className="space-y-2">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Your JazzCash Mobile Number</label>
              <Input
                placeholder="03XX-XXXXXXX"
                maxLength={11}
                value={jazzcashState.senderMobile}
                onChange={(e) => onJazzcashChange({ ...jazzcashState, senderMobile: e.target.value })}
                className="!bg-white !border-slate-300 !rounded-xl !py-1.5 !text-slate-900 font-semibold"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">Transaction ID (TID from 8558 SMS)</label>
                <button
                  type="button"
                  onClick={() =>
                    onJazzcashChange({
                      ...jazzcashState,
                      transactionRef: `JC-${Math.floor(100000 + Math.random() * 900000)}`,
                    })
                  }
                  className="text-[10px] font-bold text-amber-800 hover:underline"
                >
                  Auto-fill Demo TID
                </button>
              </div>
              <Input
                placeholder="e.g. JC-871230 or 12-digit TID"
                value={jazzcashState.transactionRef}
                onChange={(e) => onJazzcashChange({ ...jazzcashState, transactionRef: e.target.value })}
                className="!bg-white !border-slate-300 !rounded-xl !py-1.5 !text-slate-900 font-mono font-bold"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
