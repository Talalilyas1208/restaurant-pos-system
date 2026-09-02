'use client';

import React from 'react';
import { Card, Badge, Button, Tag, Space, Typography, Popconfirm } from 'antd';
import { PrinterOutlined, EyeOutlined, WifiOutlined, DeleteOutlined } from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import { Utensils } from 'lucide-react';
import { DiningTable, Hotel } from '../types';

const { Text, Title } = Typography;

interface QRStandCardProps {
  table: DiningTable;
  hotel: Hotel;
  originUrl?: string;
  onDelete?: (id: string) => void;
}

export default function QRStandCard({
  table,
  hotel,
  originUrl = 'http://localhost:3002',
  onDelete,
}: QRStandCardProps) {
  const menuUrl = `${originUrl}/menu/${hotel.slug}/${table.qrCodeToken}`;

  const handlePrintCard = () => {
    window.print();
  };

  const statusColor =
    table.status === 'available' ? 'success' : table.status === 'occupied' ? 'warning' : 'processing';

  return (
    <Badge.Ribbon
      text={`TABLE ${table.tableNumber}`}
      color="#ea580c"
      className="!font-black !text-xs !rounded-bl-xl !shadow-sm"
    >
      <Card
        hoverable
        className="!bg-white !border-slate-200/90 hover:!border-orange-400 !rounded-3xl transition-all shadow-sm hover:shadow-md"
        styles={{ body: { padding: '20px' } }}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Printable Stand Frame */}
          <div className="w-full bg-slate-50 p-5 rounded-2xl border-2 border-orange-200 shadow-inner text-slate-900 space-y-3">
            {/* Header */}
            <div className="space-y-1">
              <div className="w-10 h-10 mx-auto rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                <Utensils className="w-4 h-4" />
              </div>
              <h4 className="font-black text-sm text-slate-900">{hotel.name}</h4>
              <p className="text-[10px] font-bold text-orange-600">Contactless Digital Ordering</p>
            </div>

            {/* QR Code */}
            <div className="p-3 bg-white rounded-2xl shadow-sm mx-auto inline-block border border-slate-200">
              <QRCodeSVG
                value={menuUrl}
                size={140}
                level="H"
                includeMargin={true}
                imageSettings={
                  hotel.logoUrl
                    ? {
                        src: hotel.logoUrl,
                        x: undefined,
                        y: undefined,
                        height: 26,
                        width: 26,
                        excavate: true,
                      }
                    : undefined
                }
              />
            </div>

            {/* Instructions */}
            <div className="space-y-1">
              <Tag color="orange" className="!font-black !text-xs !px-3 !py-0.5 !rounded-md">
                {table.section} &bull; {table.capacity} Seats
              </Tag>
              <p className="text-[10px] text-slate-500 font-semibold leading-tight">
                Scan with smartphone camera to view menu & order directly.
              </p>
            </div>

            {/* Wi-Fi footer */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 px-1">
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <WifiOutlined /> Guest Wi-Fi
              </span>
              <Tag color={statusColor} className="!m-0 !text-[10px] capitalize font-bold !rounded-md">
                {table.status}
              </Tag>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full pt-1">
            <a
              href={menuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button
                block
                icon={<EyeOutlined />}
                className="!text-xs !h-9 !rounded-xl !border-slate-200 !bg-slate-100 !text-slate-800 font-bold hover:!border-orange-400"
              >
                Preview Menu
              </Button>
            </a>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              onClick={handlePrintCard}
              className="!text-xs !h-9 !rounded-xl !bg-gradient-to-r !from-orange-500 !to-amber-500 hover:!from-orange-600 !font-bold border-0 text-white"
            >
              Print
            </Button>
            {onDelete && (
              <Popconfirm
                title="Delete table?"
                description="Are you sure you want to delete this table?"
                onConfirm={() => onDelete(table.id)}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  className="!text-xs !h-9 !rounded-xl !border-rose-200 !bg-rose-50 font-bold"
                />
              </Popconfirm>
            )}
          </div>
        </div>
      </Card>
    </Badge.Ribbon>
  );
}
