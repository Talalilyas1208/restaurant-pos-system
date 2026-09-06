'use client';

import React from 'react';
import { Button, Tag, Select, Input } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { CartState, CartItem } from '../../store/slices/cartSlice';
import { StaffUser } from '../../types';
import POSTicketItemCard from './POSTicketItemCard';
import POSTicketSummary from './POSTicketSummary';

interface POSTicketSidebarProps {
  activeTab: 'menu' | 'tables' | 'cart';
  onBackToMenu: () => void;
  cart: CartState;
  activeStaff: StaffUser[];
  selectedWaiter: { id: string; name: string };
  onSelectWaiter: (waiter: { id: string; name: string }) => void;
  onClearCart: () => void;
  onChangeOrderType: (type: any) => void;
  onChangeCustomerName: (name: string) => void;
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  subtotal: number;
  taxRate: number;
  tax: number;
  serviceChargeRate: number;
  serviceCharge: number;
  discountAmount: number;
  grandTotal: number;
  onSetDiscount: (percent: number) => void;
  onOpenSplitModal: () => void;
  onCheckout: () => void;
}

export default function POSTicketSidebar({
  activeTab,
  onBackToMenu,
  cart,
  activeStaff,
  selectedWaiter,
  onSelectWaiter,
  onClearCart,
  onChangeOrderType,
  onChangeCustomerName,
  onRemoveItem,
  onUpdateQuantity,
  subtotal,
  taxRate,
  tax,
  serviceChargeRate,
  serviceCharge,
  discountAmount,
  grandTotal,
  onSetDiscount,
  onOpenSplitModal,
  onCheckout,
}: POSTicketSidebarProps) {
  return (
    <div
      className={`w-full lg:w-[420px] bg-white flex-col h-full overflow-hidden shadow-xl border-l border-slate-200 ${
        activeTab === 'cart' ? 'flex' : 'hidden lg:flex'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              type="text"
              size="small"
              onClick={onBackToMenu}
              className="lg:hidden !text-xs !font-bold !text-slate-600 !px-2 !rounded-lg !bg-slate-200"
            >
              &larr; Menu
            </Button>
            <ShoppingCartOutlined className="text-xl text-orange-600" />
            <span className="font-black text-base text-slate-900">Order Ticket</span>
            {cart.tableNumber && (
              <Tag color="orange" className="!font-black !text-xs !rounded-md">
                {cart.tableNumber}
              </Tag>
            )}
          </div>

          {cart.items.length > 0 && (
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={onClearCart}
              className="!text-xs font-bold"
            >
              Clear
            </Button>
          )}
        </div>

        {/* Waiter Attribution */}
        <div className="flex items-center gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-7 h-7 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 flex-shrink-0">
            <UserOutlined className="text-xs" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              Receiving Waiter
            </span>
            <Select
              size="small"
              variant="borderless"
              value={selectedWaiter.id}
              onChange={(val) => {
                const found = activeStaff.find((w) => w.id === val);
                if (found) onSelectWaiter({ id: found.id, name: found.name });
              }}
              options={activeStaff.map((w) => ({
                value: w.id,
                label: `${w.name} (${w.id})`,
              }))}
              className="w-full !p-0 font-bold text-slate-900"
            />
          </div>
          <Tag color="orange" className="!m-0 !font-mono !font-bold text-[10px] !rounded-md">
            {selectedWaiter.id}
          </Tag>
        </div>

        {/* Dining Type & Guest Name */}
        <div className="grid grid-cols-2 gap-2">
          <Select
            size="middle"
            value={cart.orderType}
            onChange={onChangeOrderType}
            options={[
              { label: 'Dine In', value: 'dine_in' },
              { label: 'Takeaway', value: 'takeaway' },
              { label: 'Room Service', value: 'room_service' },
            ]}
            className="w-full font-bold"
          />
          <Input
            size="middle"
            placeholder="Guest Name"
            prefix={<UserOutlined className="text-slate-400" />}
            value={cart.customerName}
            onChange={(e) => onChangeCustomerName(e.target.value)}
            className="!rounded-xl font-medium"
          />
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
        {cart.items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6 space-y-2">
            <ShoppingCartOutlined className="text-4xl text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No items added yet</p>
            <p className="text-xs text-slate-500">Tap items on the left to add to order ticket.</p>
          </div>
        ) : (
          cart.items.map((ci: CartItem) => (
            <POSTicketItemCard
              key={ci.id}
              item={ci}
              onRemove={onRemoveItem}
              onUpdateQty={onUpdateQuantity}
            />
          ))
        )}
      </div>

      {/* Calculations & Checkout Bar */}
      {cart.items.length > 0 && (
        <POSTicketSummary
          subtotal={subtotal}
          taxRate={taxRate}
          tax={tax}
          serviceChargeRate={serviceChargeRate}
          serviceCharge={serviceCharge}
          discountPercent={cart.discountPercent}
          discountAmount={discountAmount}
          grandTotal={grandTotal}
          onSetDiscount={onSetDiscount}
          onOpenSplitModal={onOpenSplitModal}
          onCheckout={onCheckout}
        />
      )}
    </div>
  );
}
