'use client';

import React from 'react';
import { Drawer, Button, Input } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined } from '@ant-design/icons';
import PaymentMethodSelector, { CardState, MobileWalletState } from '../payment/PaymentMethodSelector';
import { MenuItem, SelectedModifier } from '../../types';

const { TextArea } = Input;

export interface CartLineItem {
  id: string;
  item: MenuItem;
  quantity: number;
  modifiers: SelectedModifier[];
  instructions: string;
  totalPrice: number;
}

interface CartCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber?: string;
  cartItems: CartLineItem[];
  onRemoveItem: (index: number) => void;
  customerName: string;
  onCustomerNameChange: (val: string) => void;
  tableNotes: string;
  onTableNotesChange: (val: string) => void;
  currencySymbol?: string;
  cartSubtotal: number;
  hotelName?: string;
  paymentMethod: 'cash' | 'credit_card' | 'easypaisa' | 'jazzcash';
  onPaymentMethodChange: (val: 'cash' | 'credit_card' | 'easypaisa' | 'jazzcash') => void;
  cardState: CardState;
  onCardChange: (s: CardState) => void;
  easypaisaState: MobileWalletState;
  onEasypaisaChange: (s: MobileWalletState) => void;
  jazzcashState: MobileWalletState;
  onJazzcashChange: (s: MobileWalletState) => void;
  onPlaceOrder: () => void;
  isSyncing: boolean;
}

export default function CartCheckoutDrawer({
  isOpen,
  onClose,
  tableNumber = 'T-01',
  cartItems,
  onRemoveItem,
  customerName,
  onCustomerNameChange,
  tableNotes,
  onTableNotesChange,
  currencySymbol = '$',
  cartSubtotal,
  hotelName = 'Grand Palace Hotel & Dining',
  paymentMethod,
  onPaymentMethodChange,
  cardState,
  onCardChange,
  easypaisaState,
  onEasypaisaChange,
  jazzcashState,
  onJazzcashChange,
  onPlaceOrder,
  isSyncing,
}: CartCheckoutDrawerProps) {
  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      placement="bottom"
      styles={{
        wrapper: { height: '82vh' },
        content: { backgroundColor: '#ffffff', borderTopLeftRadius: 28, borderTopRightRadius: 28 },
        body: { padding: '20px' },
      }}
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
              <ShoppingCartOutlined className="text-base" />
            </div>
            <div>
              <span className="font-black text-base text-slate-900 block leading-tight">
                Table {tableNumber} Cart
              </span>
              <span className="text-xs text-slate-500">Contactless Kitchen Order</span>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400">{cartItems.length} items</span>
        </div>
      }
    >
      <div className="space-y-4 flex flex-col h-full justify-between">
        <div className="space-y-3 overflow-y-auto pr-1">
          {cartItems.map((ci, idx) => (
            <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{ci.item.name}</h4>
                  {ci.modifiers.length > 0 && (
                    <p className="text-xs text-orange-600 font-medium">
                      {ci.modifiers.map((m) => m.optionName).join(', ')}
                    </p>
                  )}
                  {ci.instructions && (
                    <p className="text-[11px] text-slate-500 italic">&ldquo;{ci.instructions}&rdquo;</p>
                  )}
                </div>
                <span className="font-extrabold text-sm text-slate-900">
                  {currencySymbol}{ci.totalPrice.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-xs">
                <span className="text-slate-600 font-semibold">Quantity: {ci.quantity}</span>
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => onRemoveItem(idx)}
                  className="font-semibold !text-xs"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}

          {/* Guest Name & Notes Form */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-800 block">Table & Special Instructions</span>
            <Input
              placeholder="Guest Name (e.g. John)"
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              className="!bg-slate-50 !border-slate-200 !rounded-xl !py-2 !text-slate-900 font-semibold"
            />
            <TextArea
              rows={2}
              placeholder="Allergies or kitchen instructions (e.g. extra napkins, no cilantro)..."
              value={tableNotes}
              onChange={(e) => onTableNotesChange(e.target.value)}
              className="!bg-slate-50 !border-slate-200 !rounded-xl !py-2 !text-slate-900 font-medium"
            />
          </div>

          {/* Reusable Payment Method Selector */}
          <PaymentMethodSelector
            amount={cartSubtotal}
            currencySymbol={currencySymbol}
            hotelName={hotelName}
            tableNumber={tableNumber}
            paymentMethod={paymentMethod}
            onMethodChange={onPaymentMethodChange}
            cardState={cardState}
            onCardChange={onCardChange}
            easypaisaState={easypaisaState}
            onEasypaisaChange={onEasypaisaChange}
            jazzcashState={jazzcashState}
            onJazzcashChange={onJazzcashChange}
          />
        </div>

        {/* Drawer Footer */}
        <div className="pt-3 border-t border-slate-200 space-y-3">
          <div className="flex justify-between font-black text-lg text-slate-900">
            <span>Total Order Amount</span>
            <span className="text-orange-600">{currencySymbol}{cartSubtotal.toFixed(2)}</span>
          </div>
          <Button
            type="primary"
            size="large"
            block
            onClick={onPlaceOrder}
            loading={isSyncing}
            className="!h-13 !rounded-2xl !bg-gradient-to-r !from-orange-500 via-rose-500 to-amber-500 hover:!opacity-95 !font-black !text-base !shadow-xl !shadow-orange-500/25 border-0 text-white"
          >
            {paymentMethod === 'cash'
              ? `Confirm Order (Pay Cash Later) • ${currencySymbol}${cartSubtotal.toFixed(2)}`
              : paymentMethod === 'credit_card'
              ? `Pay with Card & Confirm • ${currencySymbol}${cartSubtotal.toFixed(2)}`
              : paymentMethod === 'easypaisa'
              ? `Submit Easypaisa Order • ${currencySymbol}${cartSubtotal.toFixed(2)}`
              : `Submit JazzCash Order • ${currencySymbol}${cartSubtotal.toFixed(2)}`}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}

