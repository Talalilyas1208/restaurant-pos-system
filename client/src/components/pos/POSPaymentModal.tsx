'use client';

import React from 'react';
import { Modal, Segmented, InputNumber, Divider, Button } from 'antd';
import {
  DollarOutlined,
  CreditCardOutlined,
  BankOutlined,
  QrcodeOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import {
  CardTerminalPayment,
  CardPaymentData,
  RoomChargePayment,
  RoomChargeData,
  BankTransferQRPayment,
  BankTransferQRData,
} from '../payment';
import { Hotel } from '../../types';

interface POSPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  grandTotal: number;
  hotel?: Hotel;
  paymentMethod: 'cash' | 'credit_card' | 'room_charge' | 'bank_transfer';
  onChangeMethod: (method: 'cash' | 'credit_card' | 'room_charge' | 'bank_transfer') => void;
  cashTendered: number;
  onChangeCashTendered: (val: number) => void;
  cardData: CardPaymentData;
  onChangeCardData: (data: CardPaymentData) => void;
  roomData: RoomChargeData;
  onChangeRoomData: (data: RoomChargeData) => void;
  bankQRData: BankTransferQRData;
  onChangeBankQRData: (data: BankTransferQRData) => void;
  onConfirmPayment: () => void;
}

export default function POSPaymentModal({
  isOpen,
  onClose,
  grandTotal,
  hotel,
  paymentMethod,
  onChangeMethod,
  cashTendered,
  onChangeCashTendered,
  cardData,
  onChangeCardData,
  roomData,
  onChangeRoomData,
  bankQRData,
  onChangeBankQRData,
  onConfirmPayment,
}: POSPaymentModalProps) {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={460}
      centered
      styles={{ body: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24 } }}
      title={<span className="font-black text-base text-slate-900">Select Settlement Method</span>}
    >
      <div className="space-y-4 pt-2">
        {/* Total Due Banner */}
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl text-center">
          <span className="text-xs text-orange-700 font-bold uppercase tracking-wider block mb-1">
            Total Due
          </span>
          <span className="text-3xl font-black text-orange-600">${grandTotal.toFixed(2)}</span>
        </div>

        {/* Method Selector */}
        <Segmented
          block
          size="large"
          value={paymentMethod}
          onChange={(val) => onChangeMethod(val as any)}
          options={[
            { label: 'Cash', value: 'cash', icon: <DollarOutlined /> },
            { label: 'Card / Terminal', value: 'credit_card', icon: <CreditCardOutlined /> },
            { label: 'Room Charge', value: 'room_charge', icon: <BankOutlined /> },
            { label: 'Bank / QR Pay', value: 'bank_transfer', icon: <QrcodeOutlined /> },
          ]}
          className="!bg-slate-100 !p-1.5 !rounded-2xl !border !border-slate-200 font-bold"
        />

        {/* Method 1: Cash Tender */}
        {paymentMethod === 'cash' && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <label className="text-xs text-slate-700 font-bold block">Cash Tendered ($)</label>
            <InputNumber
              size="large"
              className="w-full !rounded-xl font-bold"
              min={grandTotal}
              step={1}
              value={cashTendered}
              onChange={(val) => onChangeCashTendered(val || grandTotal)}
            />
            <div className="flex justify-between text-xs pt-1">
              <span className="text-slate-500 font-medium">Change Due:</span>
              <span className="font-black text-emerald-600 text-sm">
                ${Math.max(0, cashTendered - grandTotal).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Method 2: Card Terminal Payment */}
        {paymentMethod === 'credit_card' && (
          <CardTerminalPayment
            amount={grandTotal}
            currencySymbol={hotel?.currencySymbol || '$'}
            value={cardData}
            onChange={onChangeCardData}
          />
        )}

        {/* Method 3: Room Charge */}
        {paymentMethod === 'room_charge' && (
          <RoomChargePayment
            amount={grandTotal}
            currencySymbol={hotel?.currencySymbol || '$'}
            value={roomData}
            onChange={onChangeRoomData}
          />
        )}

        {/* Method 4: Bank Transfer QR */}
        {paymentMethod === 'bank_transfer' && (
          <BankTransferQRPayment
            amount={grandTotal}
            currencySymbol={hotel?.currencySymbol || '$'}
            hotelName={hotel?.name}
            orderNumber={`#POS-${Date.now().toString().slice(-4)}`}
            value={bankQRData}
            onChange={onChangeBankQRData}
          />
        )}

        <Divider className="!border-slate-200 !my-3" />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <Button onClick={onClose} className="!h-10 !px-5 !rounded-xl !border-slate-200 !text-slate-700 font-bold">
            Cancel
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<CheckCircleOutlined />}
            onClick={onConfirmPayment}
            className="!h-10 !px-6 !rounded-xl !bg-gradient-to-r !from-emerald-600 !to-teal-600 hover:!from-emerald-700 !font-bold !shadow-md !shadow-emerald-600/25 border-0 text-white"
          >
            Confirm & Settle
          </Button>
        </div>
      </div>
    </Modal>
  );
}

