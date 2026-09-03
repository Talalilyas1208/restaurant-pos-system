'use client';

import React from 'react';
import { Card, Button, Tag } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { Utensils } from 'lucide-react';
import { MenuItem } from '../../types';
import StatusBadge from './StatusBadge';

interface MenuItemCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
  onPreviewTable?: (item: MenuItem) => void;
  inCartQuantity?: number;
  className?: string;
  showPreviewButton?: boolean;
}

export default function MenuItemCard({
  item,
  onSelect,
  onPreviewTable,
  inCartQuantity = 0,
  className = '',
  showPreviewButton = false,
}: MenuItemCardProps) {
  const hasModifiers = item.modifiers && item.modifiers.length > 0;
  const isAvailable = item.isAvailable !== false;

  return (
    <Card
      hoverable={isAvailable}
      onClick={() => isAvailable && onSelect(item)}
      className={`!bg-white !rounded-3xl transition-all duration-200 shadow-sm hover:shadow-md h-full flex flex-col justify-between select-none overflow-hidden ${
        isAvailable
          ? 'hover:!bg-slate-50/80 !border-slate-200/90 hover:!border-orange-400 cursor-pointer'
          : 'opacity-60 grayscale !bg-slate-100 cursor-not-allowed border-slate-200'
      } ${className}`}
      styles={{
        body: {
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between',
        },
      }}
    >
      <div>
        {/* Image Container */}
        <div className="relative h-32 w-full rounded-2xl overflow-hidden mb-3 bg-slate-100 border border-slate-100 flex items-center justify-center">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <Utensils className="w-8 h-8 text-slate-300" />
          )}

          {/* Top Dietary / Special Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
            {item.isChefSpecial && (
              <Tag color="gold" className="!m-0 !text-[10px] !font-black !rounded-md !px-1.5 shadow-2xs">
                Special ⭐
              </Tag>
            )}
            {item.isSpicy && (
              <Tag color="error" className="!m-0 !text-[10px] !font-bold !rounded-md !px-1.5 shadow-2xs">
                Spicy 🌶️
              </Tag>
            )}
            {item.isVeg && (
              <Tag color="success" className="!m-0 !text-[10px] !font-bold !rounded-md !px-1.5 shadow-2xs">
                Veg 🥗
              </Tag>
            )}
          </div>

          {/* Modifiers Pill */}
          {hasModifiers && isAvailable && (
            <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-md text-[10px] px-2 py-0.5 rounded-md text-amber-300 font-bold z-10 shadow-2xs">
              Options
            </div>
          )}

          {/* Out of Stock Overlay */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center z-10">
              <StatusBadge status="out_of_stock" size="small" />
            </div>
          )}

          {/* In Cart Badge Counter */}
          {inCartQuantity > 0 && (
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-orange-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-orange-600/30 z-10">
              {inCartQuantity}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-1">
          <h4 className="font-black text-sm text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
            {item.name}
          </h4>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {item.description || 'Freshly prepared gourmet dish.'}
          </p>
        </div>
      </div>

      {/* Price & Action Row */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="font-black text-base text-slate-900">
            ${item.price.toFixed(2)}
          </span>
          {item.preparationTime && (
            <span className="text-[10px] text-slate-400 font-bold block">
              ~{item.preparationTime}m
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {showPreviewButton && onPreviewTable && (
            <Button
              shape="circle"
              size="small"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onPreviewTable(item);
              }}
              className="!border-slate-200 !text-slate-600 hover:!text-orange-600"
              title="3D Table Preview"
            />
          )}

          <Button
            type="primary"
            shape="circle"
            icon={<PlusOutlined />}
            disabled={!isAvailable}
            className="!bg-gradient-to-r !from-orange-500 !to-amber-500 hover:!from-orange-600 !border-0 text-white !shadow-sm"
          />
        </div>
      </div>
    </Card>
  );
}
