'use client';

import React from 'react';
import { Input, Tag, Select, Checkbox, Alert } from 'antd';
import {
  BankOutlined,
  UserOutlined,
  IdcardOutlined,
  CheckCircleOutlined,
  KeyOutlined,
} from '@ant-design/icons';

export interface RoomChargeData {
  roomNumber: string;
  guestName: string;
  folioId: string;
  isVerified: boolean;
  notes?: string;
}

interface RoomChargePaymentProps {
  amount: number;
  currencySymbol?: string;
  value: RoomChargeData;
  onChange: (data: RoomChargeData) => void;
}

const COMMON_HOTEL_ROOMS = [
  'Room 101', 'Room 102', 'Room 104', 'Room 201', 'Room 204',
  'Room 205', 'Room 301', 'Room 304', 'Suite 401', 'Penthouse Suite'
];

export default function RoomChargePayment({
  amount,
  currencySymbol = '$',
  value,
  onChange,
}: RoomChargePaymentProps) {
  const updateField = (field: keyof RoomChargeData, val: any) => {
    onChange({
      ...value,
      [field]: val,
    });
  };

  return (
    <div className="space-y-3.5">
      {/* Hotel Folio Bill Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-tr from-purple-900 via-indigo-900 to-slate-900 text-white shadow-md border border-indigo-700/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <BankOutlined className="text-base" />
            </div>
            <div>
              <span className="font-bold text-xs text-purple-200 block">Hotel PMS Room Charge</span>
              <span className="text-[10px] text-slate-400">Post direct to guest stay balance</span>
            </div>
          </div>
          <Tag color="purple" className="!m-0 !text-[11px] !font-bold !rounded-md">
            FOLIO BILLING
          </Tag>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-indigo-800/80 pt-2.5">
          <span className="text-xs text-slate-300 font-medium">Charge Amount</span>
          <span className="text-xl font-black text-amber-400">
            {currencySymbol}{amount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Room Selection & Verification Fields */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Room Number <span className="text-rose-500">*</span>
          </label>
          <div className="flex gap-2">
            <Select
              showSearch
              placeholder="Quick select room"
              className="w-44 !rounded-xl font-bold"
              value={COMMON_HOTEL_ROOMS.includes(value.roomNumber) ? value.roomNumber : undefined}
              onChange={(val) => updateField('roomNumber', val)}
              options={COMMON_HOTEL_ROOMS.map((r) => ({ label: r, value: r }))}
            />
            <Input
              size="large"
              placeholder="Or type room e.g. Room 204"
              value={value.roomNumber}
              onChange={(e) => updateField('roomNumber', e.target.value)}
              prefix={<KeyOutlined className="text-purple-600" />}
              className="!rounded-xl font-bold flex-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Registered Guest Name</label>
            <Input
              size="middle"
              placeholder="Guest full name"
              value={value.guestName}
              onChange={(e) => updateField('guestName', e.target.value)}
              prefix={<UserOutlined className="text-slate-400" />}
              className="!rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Folio / Booking ID</label>
            <Input
              size="middle"
              placeholder="e.g. FOLIO-98214"
              value={value.folioId}
              onChange={(e) => updateField('folioId', e.target.value)}
              prefix={<IdcardOutlined className="text-slate-400" />}
              className="!rounded-xl font-mono text-xs font-bold"
            />
          </div>
        </div>

        {/* Verification Check */}
        <div className="pt-2 border-t border-slate-200">
          <Checkbox
            checked={value.isVerified}
            onChange={(e) => updateField('isVerified', e.target.checked)}
            className="text-xs font-bold text-slate-700"
          >
            <span className="flex items-center gap-1">
              <CheckCircleOutlined className="text-emerald-500" />
              Verified guest identity with active room keycard or signature.
            </span>
          </Checkbox>
        </div>
      </div>

      <Alert
        type="info"
        showIcon
        message="Room Billing Notice"
        description="This charge will be placed onto the hotel front desk PMS and settled upon room checkout."
        className="!rounded-xl !text-xs !bg-indigo-50/80 !border-indigo-200 !p-3"
      />
    </div>
  );
}
