'use client';

import React, { useState } from 'react';
import { Input, Button, Tag, message } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';

export interface MobileWalletState {
  senderMobile: string;
  transactionRef: string;
}

interface MobileWalletPaymentProps {
  walletType: 'easypaisa' | 'jazzcash';
  amount: number;
  currencySymbol?: string;
  hotelName: string;
  tableNumber: string;
  walletState: MobileWalletState;
  onWalletChange: (state: MobileWalletState) => void;
}

export default function MobileWalletPayment({
  walletType,
  amount,
  currencySymbol = '$',
  hotelName,
  tableNumber,
  walletState,
  onWalletChange,
}: MobileWalletPaymentProps) {
  const [copied, setCopied] = useState(false);

  const isEasypaisa = walletType === 'easypaisa';
  const tillNumber = isEasypaisa ? '0312-3456789' : '0300-1234567';
  const rawTill = tillNumber.replace('-', '');
  const brandTitle = isEasypaisa ? 'Easypaisa Mobile Wallet' : 'JazzCash Mobile Wallet';
  const brandColor = isEasypaisa ? 'text-emerald-700' : 'text-red-700';
  const badgeColor = isEasypaisa ? 'success' : 'error';
  const containerBg = isEasypaisa ? 'bg-emerald-50/70 border-emerald-200' : 'bg-red-50/70 border-red-200';
  const autoPrefix = isEasypaisa ? 'EP' : 'JC';
  const qrScheme = isEasypaisa ? 'easypaisa' : 'jazzcash';

  const copyTill = () => {
    navigator.clipboard.writeText(rawTill);
    setCopied(true);
    message.success(`${isEasypaisa ? 'Easypaisa' : 'JazzCash'} Till copied to clipboard!`);
    setTimeout(() => setCopied(false), 2500);
  };

  const autoFillTID = () => {
    onWalletChange({
      ...walletState,
      transactionRef: `${autoPrefix}-${Math.floor(100000 + Math.random() * 900000)}`,
    });
  };

  return (
    <div className={`${containerBg} border p-3.5 rounded-2xl space-y-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-8 h-8 rounded-xl ${isEasypaisa ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'} flex items-center justify-center font-black text-sm`}>
            📱
          </span>
          <div>
            <h4 className={`font-extrabold text-sm ${brandColor}`}>{brandTitle}</h4>
            <p className="text-[11px] text-slate-600 font-medium">Scan QR or Pay via Till Account</p>
          </div>
        </div>
        <Tag color={badgeColor} className="!m-0 !font-bold text-[11px] !rounded-md">
          Instant
        </Tag>
      </div>

      {/* Till Account Card */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Merchant Till / Mobile</span>
            <span className={`text-base font-black ${isEasypaisa ? 'text-emerald-600' : 'text-red-600'} font-mono`}>
              {tillNumber}
            </span>
          </div>
          <Button
            size="small"
            icon={copied ? <CheckOutlined className="text-emerald-600" /> : <CopyOutlined />}
            onClick={copyTill}
            className={`!rounded-lg !text-xs !font-bold ${isEasypaisa ? '!bg-emerald-50 !border-emerald-300 !text-emerald-900' : '!bg-red-50 !border-red-300 !text-red-900'}`}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <div className="flex items-center justify-between text-[11px] border-t border-slate-100 pt-1.5">
          <span className="text-slate-500 font-medium">Account Title:</span>
          <span className="font-bold text-slate-800">{hotelName}</span>
        </div>
      </div>

      {/* Dynamic QR Code */}
      <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
        <div className="bg-white p-1 rounded-lg border border-slate-200 flex-shrink-0">
          <QRCodeSVG
            value={`${qrScheme}://pay?account=${rawTill}&amount=${amount.toFixed(2)}&ref=${tableNumber}`}
            size={88}
            level="M"
          />
        </div>
        <div className="space-y-1 text-xs">
          <span className="font-black text-slate-800 block text-xs">Scan & Pay via {isEasypaisa ? 'Easypaisa' : 'JazzCash'} App</span>
          <p className="text-[11px] text-slate-600 font-medium leading-relaxed !m-0">
            Transfer <span className={`font-bold ${isEasypaisa ? 'text-emerald-600' : 'text-red-600'}`}>{currencySymbol}{amount.toFixed(2)}</span>, then enter your transaction ID below.
          </p>
        </div>
      </div>

      {/* Customer Inputs */}
      <div className="space-y-2">
        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">Your Mobile Number</label>
          <Input
            placeholder="03XX-XXXXXXX"
            maxLength={11}
            value={walletState.senderMobile}
            onChange={(e) => onWalletChange({ ...walletState, senderMobile: e.target.value })}
            className="!bg-white !border-slate-300 !rounded-xl !py-1.5 !text-slate-900 font-semibold"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold text-slate-700">Transaction ID (TID)</label>
            <button
              type="button"
              onClick={autoFillTID}
              className={`text-[10px] font-bold ${isEasypaisa ? 'text-emerald-700' : 'text-red-700'} hover:underline`}
            >
              Auto-fill Demo TID
            </button>
          </div>
          <Input
            placeholder={`e.g. ${autoPrefix}-892301`}
            value={walletState.transactionRef}
            onChange={(e) => onWalletChange({ ...walletState, transactionRef: e.target.value })}
            className="!bg-white !border-slate-300 !rounded-xl !py-1.5 !text-slate-900 font-mono font-bold"
          />
        </div>
      </div>
    </div>
  );
}
