'use client';

import React, { useState } from 'react';
import { Modal, Segmented, Statistic, Card, Button, Typography, Space, Divider } from 'antd';
import { UsergroupAddOutlined, SplitCellsOutlined, CheckOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  currencySymbol?: string;
  onSettleSplit: (shares: number[]) => void;
}

export default function SplitBillModal({
  isOpen,
  onClose,
  totalAmount,
  currencySymbol = '$',
  onSettleSplit,
}: SplitBillModalProps) {
  const [splitCount, setSplitCount] = useState<number>(2);

  if (!isOpen) return null;

  const equalShare = totalAmount > 0 ? parseFloat((totalAmount / splitCount).toFixed(2)) : 0;

  const handleEqualSettle = () => {
    const shares = Array(splitCount).fill(equalShare);
    onSettleSplit(shares);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={460}
      centered
      styles={{ body: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24 } }}
      title={
        <div className="flex items-center gap-2 text-orange-600">
          <SplitCellsOutlined className="text-xl" />
          <span className="font-black text-base text-slate-900">Split Bill Calculation</span>
        </div>
      }
    >
      <div className="space-y-5 pt-2 text-slate-900">
        {/* Total Bill Card */}
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl text-center">
          <span className="text-xs text-orange-700 font-bold uppercase tracking-wider block mb-1">Total Bill Amount</span>
          <span className="text-3xl font-black text-orange-600">
            {currencySymbol}{totalAmount.toFixed(2)}
          </span>
        </div>

        {/* Split Count Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <UsergroupAddOutlined className="text-orange-500" /> Split Between Diners
            </span>
            <span className="text-xs text-orange-600 font-black">{splitCount} People</span>
          </div>

          <Segmented
            block
            size="large"
            value={splitCount}
            onChange={(val) => setSplitCount(Number(val))}
            options={[
              { label: '2 Ways', value: 2 },
              { label: '3 Ways', value: 3 },
              { label: '4 Ways', value: 4 },
              { label: '5 Ways', value: 5 },
              { label: '6 Ways', value: 6 },
            ]}
            className="!bg-slate-100 !p-1.5 !rounded-2xl !border !border-slate-200 font-bold"
          />
        </div>

        {/* Equal Share Result */}
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold">
            <span>Each Person&apos;s Share:</span>
            <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold">
              Equal Division
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-700">
            {currencySymbol}
            {equalShare.toFixed(2)}{' '}
            <span className="text-xs font-bold text-emerald-600">/ person</span>
          </div>
        </div>

        <Divider className="!border-slate-200 !my-3" />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <Button onClick={onClose} className="!h-10 !px-5 !rounded-xl !border-slate-200 !text-slate-700 font-bold">
            Cancel
          </Button>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleEqualSettle}
            className="!h-10 !px-6 !rounded-xl !bg-gradient-to-r !from-orange-500 !to-amber-500 hover:!from-orange-600 !font-bold border-0 text-white"
          >
            Accept & Settle
          </Button>
        </div>
      </div>
    </Modal>
  );
}
