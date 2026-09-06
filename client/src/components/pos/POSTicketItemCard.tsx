'use client';

import React from 'react';
import { Button, Tag } from 'antd';
import { DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { CartItem } from '../../store/slices/cartSlice';

interface POSTicketItemCardProps {
  item: CartItem;
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, quantity: number) => void;
}

export default function POSTicketItemCard({
  item,
  onRemove,
  onUpdateQty,
}: POSTicketItemCardProps) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3 space-y-2 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h5 className="font-black text-sm text-slate-900">{item.name}</h5>
          <span className="text-xs text-slate-500 font-semibold">${item.unitPrice.toFixed(2)} each</span>
          {item.selectedModifiers && item.selectedModifiers.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {item.selectedModifiers.map((m, mi) => (
                <Tag key={mi} color="default" className="!text-[10px] !m-0 !rounded-md">
                  {m.optionName} {m.price > 0 && `(+$${m.price.toFixed(2)})`}
                </Tag>
              ))}
            </div>
          )}
          {item.specialInstructions && (
            <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md italic mt-1">
              &ldquo;{item.specialInstructions}&rdquo;
            </p>
          )}
        </div>
        <span className="font-black text-sm text-slate-900">${item.totalPrice.toFixed(2)}</span>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => onRemove(item.id)}
        />
        <div className="flex items-center bg-slate-100 rounded-xl p-0.5">
          <Button
            size="small"
            type="text"
            icon={<MinusOutlined />}
            onClick={() => onUpdateQty(item.id, item.quantity - 1)}
            className="!text-slate-700 font-bold"
          />
          <span className="w-7 text-center text-xs font-black text-slate-900">{item.quantity}</span>
          <Button
            size="small"
            type="text"
            icon={<PlusOutlined />}
            onClick={() => onUpdateQty(item.id, item.quantity + 1)}
            className="!text-slate-700 font-bold"
          />
        </div>
      </div>
    </div>
  );
}

