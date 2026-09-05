'use client';

import React from 'react';
import { Input, Tag } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';

export interface CardState {
  cardNumber: string;
  cardholderName: string;
  expiry: string;
  cvv: string;
}

interface CardPaymentFormProps {
  cardState: CardState;
  onCardChange: (state: CardState) => void;
}

export default function CardPaymentForm({ cardState, onCardChange }: CardPaymentFormProps) {
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    onCardChange({ ...cardState, cardNumber: formatted });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    const formatted = raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
    onCardChange({ ...cardState, expiry: formatted });
  };

  const autoFillDemo = () => {
    onCardChange({
      cardNumber: '4242 4242 4242 4242',
      cardholderName: 'John Doe',
      expiry: '12/28',
      cvv: '888',
    });
  };

  return (
    <div className="bg-blue-50/70 border border-blue-200 p-3.5 rounded-2xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-black text-sm">
            💳
          </span>
          <div>
            <h4 className="font-extrabold text-sm text-blue-950">Debit / Credit Card</h4>
            <p className="text-[11px] text-slate-600 font-medium">Instant gateway tokenization</p>
          </div>
        </div>
        <Tag color="blue" className="!m-0 !font-bold text-[11px] !rounded-md">
          Visa / MC / Amex
        </Tag>
      </div>

      <div className="space-y-2">
        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">Cardholder Name</label>
          <Input
            placeholder="e.g. John Doe"
            value={cardState.cardholderName}
            onChange={(e) => onCardChange({ ...cardState, cardholderName: e.target.value })}
            className="!bg-white !border-slate-300 !rounded-xl !py-1.5 !text-slate-900 font-semibold"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold text-slate-700">Card Number</label>
            <button
              type="button"
              onClick={autoFillDemo}
              className="text-[10px] font-bold text-blue-700 hover:underline"
            >
              Auto-fill Test Card
            </button>
          </div>
          <Input
            prefix={<CreditCardOutlined className="text-slate-400 mr-1" />}
            placeholder="4242 •••• •••• 4242"
            maxLength={19}
            value={cardState.cardNumber}
            onChange={handleCardNumberChange}
            className="!bg-white !border-slate-300 !rounded-xl !py-1.5 !text-slate-900 font-mono font-bold"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Expiry (MM/YY)</label>
            <Input
              placeholder="MM/YY"
              maxLength={5}
              value={cardState.expiry}
              onChange={handleExpiryChange}
              className="!bg-white !border-slate-300 !rounded-xl !py-1.5 !text-slate-900 font-mono font-semibold text-center"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">CVV / CVC</label>
            <Input.Password
              placeholder="•••"
              maxLength={4}
              value={cardState.cvv}
              onChange={(e) => onCardChange({ ...cardState, cvv: e.target.value })}
              className="!bg-white !border-slate-300 !rounded-xl !py-1.5 !text-slate-900 font-mono font-semibold"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
