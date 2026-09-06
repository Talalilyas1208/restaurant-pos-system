'use client';

import React from 'react';
import { Space, Button } from 'antd';
import { PrinterOutlined, PlusOutlined } from '@ant-design/icons';
import { DiningTable, Hotel } from '../../types';
import QRStandCard from '../QRStandCard';

interface AdminQRTabProps {
  tables: DiningTable[];
  hotel: Hotel | undefined;
  onOpenNewTable: () => void;
  onDeleteTable: (id: string) => void;
}

export default function AdminQRTab({
  tables,
  hotel,
  onOpenNewTable,
  onDeleteTable,
}: AdminQRTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 p-5 rounded-3xl shadow-sm">
        <div>
          <h3 className="font-black text-base text-slate-900">Table Stand QR Generator</h3>
          <p className="text-xs text-slate-500 font-medium">
            Generate high-resolution printable table cards with embedded menu deep-links.
          </p>
        </div>
        <Space>
          <Button
            icon={<PrinterOutlined />}
            onClick={() => window.print()}
            className="!h-10 !rounded-xl !border-slate-200 !bg-slate-100 !text-slate-800 font-bold"
          >
            Print All Stands
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onOpenNewTable}
            className="!h-10 !rounded-xl !bg-gradient-to-r !from-orange-500 !to-amber-500 hover:!from-orange-600 !font-bold !shadow-md border-0 text-white"
          >
            Add Table / Room
          </Button>
        </Space>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tables.map((tbl) => (
          <QRStandCard
            key={tbl.id}
            table={tbl}
            hotel={hotel || ({ name: 'POS Project Bistro', slug: 'pos-project' } as any)}
            onDelete={onDeleteTable}
          />
        ))}
      </div>
    </div>
  );
}
