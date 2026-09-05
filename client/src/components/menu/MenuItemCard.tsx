'use client';

import React from 'react';
import { Button } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { MenuItem } from '../../types';

interface MenuItemCardProps {
  item: MenuItem;
  currencySymbol?: string;
  onSelect: (item: MenuItem) => void;
  onPreview: (item: MenuItem, e: React.MouseEvent) => void;
}

export default function MenuItemCard({
  item,
  currencySymbol = '$',
  onSelect,
  onPreview,
}: MenuItemCardProps) {
  return (
    <div
      onClick={() => onSelect(item)}
      className="bg-white hover:bg-slate-50/80 p-3.5 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex gap-3.5 items-start relative group"
    >
      {/* Dish Info */}
      <div className="flex-1 flex flex-col justify-between self-stretch space-y-2">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {item.isChefSpecial && (
              <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                Chef Special
              </span>
            )}
            {item.isVeg && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                Vegetarian
              </span>
            )}
            {item.isSpicy && (
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                Spicy 🌶️
              </span>
            )}
          </div>

          <h3 className="font-extrabold text-sm text-slate-900 leading-snug group-hover:text-orange-600 transition-colors">
            {item.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {item.description || 'Freshly made with artisanal ingredients.'}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between pt-1">
          <span className="font-black text-base text-slate-900">
            {currencySymbol}{item.price.toFixed(2)}
          </span>

          <div className="flex items-center gap-2">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={(e) => onPreview(item, e)}
              className="!rounded-xl !bg-slate-100 hover:!bg-slate-200 !border-slate-200 !text-slate-700 !font-bold !text-[11px] !h-7 !px-2.5"
            >
              Preview
            </Button>

            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(item);
              }}
              className="!bg-gradient-to-r !from-orange-500 !to-amber-500 hover:!from-orange-600 !font-bold !rounded-xl !h-7 !px-3 !shadow-sm !shadow-orange-500/20"
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Dish Image */}
      <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200 relative flex items-center justify-center">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span className="text-2xl">🍽️</span>
        )}
      </div>
    </div>
  );
}
