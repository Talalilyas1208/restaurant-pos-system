'use client';

import React, { useState } from 'react';
import { Input, Button, Tag, Typography, message, Tooltip } from 'antd';
import {
  QrcodeOutlined,
  BankOutlined,
  CopyOutlined,
  CheckOutlined,
  BarcodeOutlined,
  UserOutlined,
  ScanOutlined,
} from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';

const { Text } = Typography;

export interface BankTransferQRData {
  transferRef: string;
  senderName: string;
  senderBank?: string;
  qrVerified?: boolean;
}

interface BankTransferQRPaymentProps {
  amount: number;
  currencySymbol?: string;
  hotelName?: string;
  orderNumber?: string;
  value: BankTransferQRData;
  onChange: (data: BankTransferQRData) => void;
}

export default function BankTransferQRPayment({
  amount,
  currencySymbol = '$',
  hotelName = 'POS Project Bistro',
  orderNumber = '#POS-2001',
  value,
  onChange,
}: BankTransferQRPaymentProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const bankDetails = {
    bankName: 'City Commercial Bank',
    accountName: hotelName || 'POS Restaurant Group LLC',
    accountNumber: '8942-0019-3829-10',
    iban: 'US89 CITI 0019 3829 1000',
    swift: 'CITIUS33XXX',
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    message.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const updateField = (field: keyof BankTransferQRData, val: string) => {
    onChange({
      ...value,
      [field]: val,
    });
  };

  // Payment QR data payload (Universal Payment Link / UPI / Instant SEPA format)
  const qrPayload = `https://pos-pay.restaurant.internal/pay?merchant=${encodeURIComponent(hotelName)}&ref=${encodeURIComponent(orderNumber)}&amt=${amount.toFixed(2)}`;

  return (
    <div className="space-y-4">
      {/* Top QR Code Scan Section */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        {/* Dynamic QR Box */}
        <div className="p-3 bg-slate-50 rounded-2xl border-2 border-orange-300/80 flex flex-col items-center justify-center flex-shrink-0 shadow-inner">
          <QRCodeSVG
            value={qrPayload}
            size={130}
            level="M"
            includeMargin={false}
            className="rounded-lg"
          />
          <span className="text-[10px] font-bold text-slate-500 mt-2 flex items-center gap-1">
            <ScanOutlined className="text-orange-500" /> Scan to Pay
          </span>
        </div>

        {/* QR Scan Instructions */}
        <div className="flex-1 space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-between">
            <Tag color="orange" className="!text-[10px] !font-bold !rounded-md !m-0">
              INSTANT QR SCAN
            </Tag>
            <span className="text-xs font-black text-slate-900 hidden sm:inline">
              Total: {currencySymbol}{amount.toFixed(2)}
            </span>
          </div>

          <h4 className="font-extrabold text-sm text-slate-900 pt-1">
            Scan with Any Banking or Mobile Pay App
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Customer can scan with their smartphone camera, bank app, Apple Pay, or Google Wallet to complete instant transfer.
          </p>
        </div>
      </div>

      {/* Direct Bank Wire / IBAN Account Details */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <BankOutlined className="text-blue-600" /> Official Receiving Bank Account
          </span>
          <span className="text-[11px] font-bold text-slate-500">{bankDetails.bankName}</span>
        </div>

        {/* Account Name */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Beneficiary Name:</span>
          <span className="font-bold text-slate-800">{bankDetails.accountName}</span>
        </div>

        {/* Account / IBAN with Copy */}
        <div className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-slate-200">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Account / IBAN</span>
            <span className="font-mono font-black text-slate-900 text-xs">{bankDetails.iban}</span>
          </div>
          <Button
            size="small"
            type="text"
            icon={copiedField === 'IBAN' ? <CheckOutlined className="text-emerald-500" /> : <CopyOutlined />}
            onClick={() => copyToClipboard(bankDetails.iban, 'IBAN')}
            className="!rounded-lg font-bold text-xs"
          >
            {copiedField === 'IBAN' ? 'Copied' : 'Copy'}
          </Button>
        </div>

        {/* SWIFT / Routing */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">SWIFT / BIC:</span>
          <span className="font-mono font-bold text-slate-700">{bankDetails.swift}</span>
        </div>
      </div>

      {/* Confirmation & Transfer Reference Input */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
        <label className="text-xs font-bold text-slate-800 block">
          Transfer Verification & Reference
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Transaction Ref / UTR / Trace <span className="text-rose-500">*</span>
            </label>
            <Input
              size="middle"
              placeholder="e.g. UTR-9842109"
              value={value.transferRef}
              onChange={(e) => updateField('transferRef', e.target.value)}
              prefix={<BarcodeOutlined className="text-orange-500" />}
              className="!rounded-xl font-mono text-xs font-bold"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Sender Account / Payer Name
            </label>
            <Input
              size="middle"
              placeholder="e.g. Emma Watson"
              value={value.senderName}
              onChange={(e) => updateField('senderName', e.target.value)}
              prefix={<UserOutlined className="text-slate-400" />}
              className="!rounded-xl font-bold"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
