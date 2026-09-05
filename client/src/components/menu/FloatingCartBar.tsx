'use client';

import React from 'react';
import { Button } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';

interface FloatingCartBarProps {
  totalCount: number;
  subtotal: number;
  currencySymbol?: string;
  onOpenCart: () => void;
}

export default function FloatingCartBar({
  totalCount,
  subtotal,
  currencySymbol = '$',
  onOpenCart,
}: FloatingCartBarProps) {
  if (totalCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40">
      <Button
        type="primary"
        size="large"
        block
        icon={<ShoppingCartOutlined className="text-lg" />}
        onClick={onOpenCart}
        className="!h-14 !rounded-2xl !bg-gradient-to-r !from-orange-500 via-rose-500 to-amber-500 hover:!opacity-95 !font-black !text-base !shadow-2xl !shadow-orange-500/40 flex items-center justify-between px-5 border-0 text-white"
      >
        <div className="flex items-center gap-2.5">
          <span className="bg-white text-orange-600 font-black text-xs px-2.5 py-0.5 rounded-full shadow-sm">
            {totalCount} {totalCount === 1 ? 'item' : 'items'}
          </span>
          <span className="text-white font-bold text-sm">View Table Cart</span>
        </div>
        <span className="text-white font-black text-base">{currencySymbol}{subtotal.toFixed(2)} &rarr;</span>
      </Button>
    </div>
  );
}

