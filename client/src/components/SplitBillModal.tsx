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
      title={
        <div className="flex items-center gap-2 text-orange-400">
          <SplitCellsOutlined className="text-xl" />
          <span className="font-bold text-base text-slate-100">Split Bill Calculation</span>
        </div>
      }
    >
      <div className="space-y-5 pt-2">
        {/* Total Bill Card */}
        <Card className="!bg-slate-900 !border-slate-800 text-center">
          <Statistic
            title={<Text className="!text-slate-400 !text-xs uppercase tracking-wider">Total Bill Amount</Text>}
            value={totalAmount}
            precision={2}
            prefix={currencySymbol}
            valueStyle={{ color: '#f97316', fontWeight: 'bold', fontSize: '2rem' }}
          />
        </Card>

        {/* Split Count Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <UsergroupAddOutlined className="text-orange-400" /> Split Between Diners
            </span>
            <span className="text-xs text-orange-400 font-bold">{splitCount} People</span>
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
            className="!bg-slate-900 !p-1.5 !rounded-xl !border !border-slate-800"
          />
        </div>

        {/* Equal Share Result */}
        <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Each Person&apos;s Share:</span>
            <span className="bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full font-semibold">
              Equal Division
            </span>
          </div>
          <div className="text-2xl font-black text-orange-400">
            {currencySymbol}
            {equalShare.toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-400">/ person</span>
          </div>
        </div>

        <Divider className="!border-slate-800 !my-3" />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <Button onClick={onClose} className="!h-10 !px-5 !rounded-xl !border-slate-700 !text-slate-300">
            Cancel
          </Button>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleEqualSettle}
            className="!h-10 !px-6 !rounded-xl !bg-orange-500 !font-semibold !shadow-lg !shadow-orange-500/25"
          >
            Accept & Settle
          </Button>
        </div>
      </div>
    </Modal>
  );
}
