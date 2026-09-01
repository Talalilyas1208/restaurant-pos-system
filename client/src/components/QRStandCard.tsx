'use client';

import React from 'react';
import { Card, Badge, Button, Tag, Space, Typography } from 'antd';
import { PrinterOutlined, EyeOutlined, WifiOutlined, CheckCircleFilled } from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import { Utensils } from 'lucide-react';
import { DiningTable, Hotel } from '../types';

const { Text, Title } = Typography;

interface QRStandCardProps {
  table: DiningTable;
  hotel: Hotel;
  originUrl?: string;
}

export default function QRStandCard({ table, hotel, originUrl = 'http://localhost:3002' }: QRStandCardProps) {
  const menuUrl = `${originUrl}/menu/${hotel.slug}/${table.qrCodeToken}`;

  const handlePrintCard = () => {
    window.print();
  };

  const statusColor =
    table.status === 'available' ? 'success' : table.status === 'occupied' ? 'warning' : 'processing';

  return (
    <Badge.Ribbon
      text={`TABLE ${table.tableNumber}`}
      color="#f97316"
      className="!font-bold !text-xs !shadow-md"
    >
      <Card
        hoverable
        className="!bg-slate-900 !border-slate-800 hover:!border-orange-500/50 !rounded-2xl transition-all shadow-xl"
        styles={{ body: { padding: '20px' } }}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Printable Stand Frame */}
          <div className="w-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-5 rounded-2xl border-2 border-orange-500/30 shadow-2xl text-white space-y-3">
            {/* Header */}
            <div className="space-y-1">
              <div className="w-9 h-9 mx-auto rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                <Utensils className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-white">{hotel.name}</h4>
              <p className="text-[10px] text-slate-400">Contactless Digital Ordering</p>
            </div>

            {/* QR Code */}
            <div className="p-2.5 bg-white rounded-xl shadow-inner mx-auto inline-block border border-orange-300">
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
              <Tag color="orange" className="!font-bold !text-xs !px-3 !py-0.5 !rounded-full">
                {table.section} &bull; {table.capacity} Seats
              </Tag>
              <p className="text-[10px] text-slate-300 leading-tight">
                Scan with smartphone camera to view menu & order directly.
              </p>
            </div>

            {/* Wi-Fi footer */}
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span className="flex items-center gap-1 text-emerald-400">
                <WifiOutlined /> Guest Wi-Fi
              </span>
              <Tag color={statusColor} className="!m-0 !text-[10px] capitalize">
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
                className="!text-xs !h-9 !rounded-xl !border-slate-700 !bg-slate-800 !text-slate-200 hover:!border-orange-500"
              >
                Preview Menu
              </Button>
            </a>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              onClick={handlePrintCard}
              className="!text-xs !h-9 !rounded-xl !bg-orange-500 !shadow-md !shadow-orange-500/20"
            >
              Print Stand
            </Button>
          </div>
        </div>
      </Card>
    </Badge.Ribbon>
  );
}
