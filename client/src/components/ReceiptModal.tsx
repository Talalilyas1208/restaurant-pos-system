'use client';

import React from 'react';
import { Order, Hotel } from '../types';
import { Printer, X, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface ReceiptModalProps {
  order: Order | null;
  hotel: Hotel | null;
  isOpen: boolean;
  onClose: () => void;
  tenderedAmount?: number;
  changeDue?: number;
  paymentMethod?: string;
}

export default function ReceiptModal({
  order,
  hotel,
  isOpen,
  onClose,
  tenderedAmount,
  changeDue,
  paymentMethod = 'Cash',
}: ReceiptModalProps) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const hotelName = hotel?.name || 'Grand Horizon Hotel & Bistro';
  const currencySymbol = hotel?.currencySymbol || '$';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold text-sm">Payment Successful</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Body (The part styled for 80mm thermal receipt) */}
        <div className="p-6 overflow-y-auto bg-white text-black font-mono text-xs space-y-4">
          <div id="thermal-receipt" className="space-y-3 text-center">
            {/* Business Header */}
            <div>
              <h2 className="font-bold text-base uppercase tracking-wider text-black">{hotelName}</h2>
              <p className="text-[11px] text-gray-600">{hotel?.address || '742 Evergreen Terrace'}</p>
              <p className="text-[11px] text-gray-600">Tel: {hotel?.phone || '+1 (555) 234-5678'}</p>
              <div className="border-b border-dashed border-gray-400 my-2" />
            </div>

            {/* Order Meta */}
            <div className="text-left space-y-0.5 text-[11px]">
              <div className="flex justify-between">
                <span>Order No:</span>
                <span className="font-bold">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Table / Room:</span>
                <span className="font-bold">{order.tableNumber || 'Takeaway'}</span>
              </div>
              <div className="flex justify-between">
                <span>Guest:</span>
                <span>{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Server:</span>
                <span>{order.serverStaffId || 'Terminal #1'}</span>
              </div>
            </div>

            <div className="border-b border-dashed border-gray-400 my-2" />

            {/* Line Items */}
            <div className="text-left space-y-1.5">
              <div className="flex justify-between font-bold border-b border-gray-300 pb-1">
                <span>ITEM</span>
                <span>QTY x PRICE</span>
                <span>TOTAL</span>
              </div>
              {order.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500">
                      {item.quantity} x {currencySymbol}
                      {item.unitPrice.toFixed(2)}
                    </span>
                    <span className="font-semibold">
                      {currencySymbol}
                      {item.totalPrice.toFixed(2)}
                    </span>
                  </div>
                  {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                    <div className="text-[10px] text-gray-500 pl-2">
                      {item.selectedModifiers.map((m, mi) => (
                        <span key={mi}>
                          +{m.optionName} ({currencySymbol}
                          {m.price.toFixed(2)}){' '}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-b border-dashed border-gray-400 my-2" />

            {/* Financial Summary */}
            <div className="text-left space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>
                  {currencySymbol}
                  {order.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({hotel?.taxRate || 8.5}%):</span>
                <span>
                  {currencySymbol}
                  {order.tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Service Charge ({hotel?.serviceChargeRate || 5}%):</span>
                <span>
                  {currencySymbol}
                  {order.serviceCharge.toFixed(2)}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-700 font-bold">
                  <span>Discount:</span>
                  <span>
                    -{currencySymbol}
                    {order.discountAmount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="border-b border-double border-gray-500 my-1" />
              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL AMOUNT:</span>
                <span>
                  {currencySymbol}
                  {order.total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Payment Method:</span>
                <span className="uppercase font-semibold">{paymentMethod}</span>
              </div>
              {tenderedAmount !== undefined && (
                <div className="flex justify-between text-gray-700">
                  <span>Amount Tendered:</span>
                  <span>
                    {currencySymbol}
                    {tenderedAmount.toFixed(2)}
                  </span>
                </div>
              )}
              {changeDue !== undefined && changeDue > 0 && (
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Change Returned:</span>
                  <span>
                    {currencySymbol}
                    {changeDue.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="border-b border-dashed border-gray-400 my-2" />

            {/* QR Code on Receipt for feedback & e-invoice */}
            <div className="flex flex-col items-center justify-center pt-1 space-y-1">
              <QRCodeSVG
                value={`https://grandhorizon.com/invoice/${order.orderNumber}`}
                size={70}
                bgColor="#ffffff"
                fgColor="#000000"
                level="L"
              />
              <p className="text-[9px] text-gray-500">Scan for e-invoice & loyalty points</p>
              <p className="text-[10px] font-semibold tracking-wider pt-1">THANK YOU FOR DINING WITH US!</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-orange-500/25"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
