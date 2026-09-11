'use client';

import React from 'react';
import { Modal, Button } from 'antd';
import { PrinterOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Order, Hotel } from '../types';
import ReceiptPrintContent from './receipt/ReceiptPrintContent';

interface ReceiptModalProps {
  order: Order | null;
  hotel: Hotel | null;
  isOpen: boolean;
  onClose: () => void;
  tenderedAmount?: number;
  changeDue?: number;
  paymentMethod?: string;
  cardBrand?: string;
  cardLast4?: string;
  authCode?: string;
  roomNumber?: string;
  transferRef?: string;
}

export default function ReceiptModal({
  order,
  hotel,
  isOpen,
  onClose,
  tenderedAmount,
  changeDue,
  paymentMethod = 'Cash',
  cardBrand,
  cardLast4,
  authCode,
  roomNumber,
  transferRef,
}: ReceiptModalProps) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={450}
      centered
      title={
        <div className="flex items-center gap-2 text-emerald-400">
          <CheckCircleOutlined className="text-xl" />
          <span className="font-bold text-base text-slate-100">Payment Completed Successfully</span>
        </div>
      }
    >
      <div className="space-y-4 pt-2">
        <div className="p-6 bg-white text-black font-mono text-xs rounded-2xl shadow-inner max-h-[60vh] overflow-y-auto">
          <ReceiptPrintContent
            order={order}
            hotel={hotel}
            tenderedAmount={tenderedAmount}
            changeDue={changeDue}
            paymentMethod={paymentMethod}
            cardBrand={cardBrand}
            cardLast4={cardLast4}
            authCode={authCode}
            roomNumber={roomNumber}
            transferRef={transferRef}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button onClick={onClose} className="!h-10 !px-5 !rounded-xl !border-slate-700 !text-slate-300">
            Close
          </Button>
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            className="!h-10 !px-6 !rounded-xl !bg-orange-500 !font-semibold !shadow-lg !shadow-orange-500/25"
          >
            Print Receipt
          </Button>
        </div>
      </div>
    </Modal>
  );
}
