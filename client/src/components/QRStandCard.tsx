'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Utensils, Wifi, Sparkles, Download, Printer } from 'lucide-react';
import { DiningTable, Hotel } from '../types';

interface QRStandCardProps {
  table: DiningTable;
  hotel: Hotel;
  originUrl?: string;
}

export default function QRStandCard({ table, hotel, originUrl = 'http://localhost:3000' }: QRStandCardProps) {
  const menuUrl = `${originUrl}/menu/${hotel.slug}/${table.qrCodeToken}`;

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center shadow-xl hover:border-slate-700 transition-all">
      {/* Printable Card Area */}
      <div className="w-full max-w-[280px] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border-2 border-orange-500/40 shadow-2xl text-white space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <div className="w-10 h-10 mx-auto rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <Utensils className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base tracking-tight text-white">{hotel.name}</h3>
          <p className="text-[11px] text-slate-400">Contactless Digital Menu & Ordering</p>
        </div>

        {/* QR Frame */}
        <div className="p-3 bg-white rounded-xl shadow-inner mx-auto inline-block border-2 border-orange-400/50">
          <QRCodeSVG
            value={menuUrl}
            size={160}
            level="H"
            includeMargin={true}
            imageSettings={
              hotel.logoUrl
                ? {
                    src: hotel.logoUrl,
                    x: undefined,
                    y: undefined,
                    height: 30,
                    width: 30,
                    excavate: true,
                  }
                : undefined
            }
          />
        </div>

        {/* Table & Instructions */}
        <div className="space-y-1.5 pt-1">
          <div className="inline-block px-3 py-1 rounded-full bg-orange-500 text-white font-bold text-sm shadow-md">
            TABLE {table.tableNumber}
          </div>
          <p className="text-[11px] text-slate-300">
            Scan with smartphone camera to view menu, customize dishes & order directly.
          </p>
        </div>

        {/* Table Info Badge */}
        <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span className="flex items-center gap-1">
            <Wifi className="w-3 h-3 text-emerald-400" /> Free Guest Wi-Fi
          </span>
          <span className="flex items-center gap-1 text-orange-300">
            <Sparkles className="w-3 h-3" /> {table.section}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-4 w-full">
        <a
          href={menuUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors text-center"
        >
          Preview Menu
        </a>
        <button
          onClick={handlePrintCard}
          className="py-2 px-3 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-xs font-medium text-orange-300 flex items-center gap-1.5 transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Stand</span>
        </button>
      </div>
    </div>
  );
}
