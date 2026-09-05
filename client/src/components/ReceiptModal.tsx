'use client';

import React from 'react';
import { Modal, Button, Tag, Divider, Space } from 'antd';
import { PrinterOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import { Order, Hotel } from '../types';

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

  const hotelName = hotel?.name || 'POS Project Bistro';
  const currencySymbol = hotel?.currencySymbol || '$';

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
        {/* Printable 80mm Thermal Receipt Canvas */}
        <div className="p-6 bg-white text-black font-mono text-xs rounded-2xl shadow-inner max-h-[60vh] overflow-y-auto">
          <div id="thermal-receipt" className="space-y-3 text-center">
            {/* Business Header */}
            <div>
              <h2 className="font-bold text-base uppercase tracking-wider text-black">{hotelName}</h2>
              <p className="text-[11px] text-gray-600">{hotel?.address || '742 Restaurant Ave, Suite 100'}</p>
              <p className="text-[11px] text-gray-600">Tel: {hotel?.phone || '+1 (555) 234-5678'}</p>
              <div className="border-b border-dashed border-gray-400 my-2" />
            </div>

            {/* Order Metadata */}
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
                <span>Guest Name:</span>
                <span>{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Waiter / Server:</span>
                <span className="font-bold">{order.serverStaffName ? `${order.serverStaffName} (${order.serverStaffId})` : (order.serverStaffId || 'Marco Rossi (W-101)')}</span>
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
                <span>TOTAL PAID:</span>
                <span>
                  {currencySymbol}
                  {order.total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-700 pt-1">
                <span>Payment Method:</span>
                <span className="uppercase font-semibold text-right">
                  {paymentMethod === 'credit_card'
                    ? `${cardBrand || 'Card'}${cardLast4 ? ` •••• ${cardLast4}` : ''}`
                    : paymentMethod === 'room_charge'
                    ? `Room Charge${roomNumber ? ` (${roomNumber})` : ''}`
                    : paymentMethod === 'bank_transfer'
                    ? `Bank Wire / QR Pay${transferRef ? ` (#${transferRef})` : ''}`
                    : 'Cash'}
                </span>
              </div>
              {authCode && (
                <div className="flex justify-between text-gray-500 text-[10px]">
                  <span>Approval Auth Code:</span>
                  <span className="font-mono">{authCode}</span>
                </div>
              )}
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

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center pt-1 space-y-1">
              <QRCodeSVG
                value={`https://grandhorizon.com/invoice/${order.orderNumber}`}
                size={75}
                bgColor="#ffffff"
                fgColor="#000000"
                level="L"
              />
              <p className="text-[9px] text-gray-500">Scan for e-invoice & guest feedback</p>
              <p className="text-[10px] font-bold tracking-wider pt-1">THANK YOU FOR DINING WITH US!</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
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
