'use client';

import React, { useState } from 'react';
import { Modal, Tag, Button, Segmented, Tooltip } from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  FireOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { Utensils, Sun, Sunset, Flame, Sparkles, Heart, Clock, Award } from 'lucide-react';
import { MenuItem } from '../types';

interface FoodTablePreviewModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOrder: (item: MenuItem) => void;
}

export default function FoodTablePreviewModal({
  item,
  isOpen,
  onClose,
  onOrder,
}: FoodTablePreviewModalProps) {
  const [lighting, setLighting] = useState<'daylight' | 'sunset' | 'candlelight'>('daylight');

  if (!item) return null;

  // Dynamic ambiance styles for the interactive dining table
  const ambianceConfig = {
    daylight: {
      tableBg: 'bg-gradient-to-b from-amber-50/90 via-slate-100 to-amber-100/80',
      plateShadow: 'shadow-[0_20px_50px_rgba(0,0,0,0.18)]',
      glow: 'from-amber-200/40 via-sky-100/30 to-transparent',
      rimColor: 'border-white/80',
      label: 'Natural Daylight',
      textColor: 'text-slate-800',
    },
    sunset: {
      tableBg: 'bg-gradient-to-b from-amber-900/60 via-orange-950/70 to-slate-900',
      plateShadow: 'shadow-[0_25px_60px_rgba(234,88,12,0.35)]',
      glow: 'from-orange-500/30 via-amber-500/20 to-transparent',
      rimColor: 'border-amber-400/60',
      label: 'Golden Hour Sunset',
      textColor: 'text-amber-100',
    },
    candlelight: {
      tableBg: 'bg-gradient-to-b from-slate-950 via-slate-900 to-rose-950/60',
      plateShadow: 'shadow-[0_30px_70px_rgba(244,63,94,0.3)]',
      glow: 'from-rose-500/25 via-amber-600/20 to-transparent',
      rimColor: 'border-rose-400/40',
      label: 'Intimate Candlelight',
      textColor: 'text-rose-100',
    },
  }[lighting];

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={680}
      centered
      className="food-table-preview-modal"
      styles={{
        body: {
          backgroundColor: '#ffffff',
          borderRadius: 24,
          padding: 0,
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.25)',
        },
      }}
    >
      <div className="flex flex-col text-slate-900 bg-white">
        {/* Top Visual Table Setting */}
        <div className={`relative h-72 w-full ${ambianceConfig.tableBg} flex flex-col items-center justify-center p-6 overflow-hidden transition-all duration-500 border-b border-slate-200`}>
          {/* Ambient Glow */}
          <div className={`absolute inset-0 bg-gradient-to-t ${ambianceConfig.glow} pointer-events-none transition-all duration-500`} />

          {/* Table Mat / Linen Texture */}
          <div className="absolute inset-x-8 inset-y-4 rounded-3xl border border-dashed border-slate-300/60 pointer-events-none opacity-60" />

          {/* Table Ambiance Switcher Pill */}
          <div className="absolute top-4 right-4 z-20">
            <Segmented
              size="small"
              value={lighting}
              onChange={(val) => setLighting(val as any)}
              options={[
                { label: 'Day', value: 'daylight', icon: <Sun className="w-3.5 h-3.5" /> },
                { label: 'Sunset', value: 'sunset', icon: <Sunset className="w-3.5 h-3.5" /> },
                { label: 'Candle', value: 'candlelight', icon: <Flame className="w-3.5 h-3.5 text-rose-500" /> },
              ]}
              className="!bg-white/90 !backdrop-blur !p-0.5 !rounded-xl !shadow-md !border !border-slate-200 text-xs font-semibold"
            />
          </div>

          {/* Table Badge */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[11px] font-bold text-slate-700 shadow-sm border border-slate-200">
            <Sparkles className="w-3 h-3 text-orange-500" />
            <span>Table Serving Preview</span>
          </div>

          {/* Main Dish Serving Plate (Visual 3D Rim Plate) */}
          <div className="relative z-10 group">
            {/* Outer Porcelain Plate Rim */}
            <div className={`w-52 h-52 sm:w-56 sm:h-56 rounded-full bg-white p-2.5 ${ambianceConfig.plateShadow} border-4 ${ambianceConfig.rimColor} flex items-center justify-center transition-all duration-500 hover:scale-105`}>
              {/* Inner Plate Well */}
              <div className="w-full h-full rounded-full overflow-hidden relative shadow-inner bg-slate-100 flex items-center justify-center border border-slate-200">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 opacity-40">
                  <Utensils className="w-12 h-12" />
                </div>
              </div>
            </div>

            {/* Fork & Knife Decor Elements */}
            <div className="absolute -left-7 top-1/2 -translate-y-1/2 opacity-60 text-slate-400 font-serif text-xs select-none pointer-events-none">
              🍴
            </div>
            <div className="absolute -right-7 top-1/2 -translate-y-1/2 opacity-60 text-slate-400 font-serif text-xs select-none pointer-events-none">
              🍷
            </div>
          </div>

          {/* Plate Reflection Bottom Label */}
          <div className="absolute bottom-2 z-10 text-center">
            <span className="text-[11px] font-semibold text-slate-500 bg-white/80 backdrop-blur px-2.5 py-0.5 rounded-full shadow-sm">
              Ambiance: {ambianceConfig.label}
            </span>
          </div>
        </div>

        {/* Dish Info & Ordering Section (Crisp White UI) */}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {item.isChefSpecial && <Tag color="gold" className="!font-bold !text-xs">Chef Special</Tag>}
                {item.isVeg && <Tag color="success" className="!font-semibold !text-xs">Vegetarian</Tag>}
                {item.isSpicy && <Tag color="error" className="!font-semibold !text-xs">Spicy</Tag>}
                {item.preparationTime && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {item.preparationTime} mins prep
                  </span>
                )}
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{item.name}</h3>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 uppercase font-semibold block">Price</span>
              <span className="text-2xl font-black text-orange-600">${item.price.toFixed(2)}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            {item.description || 'Artisanal freshly prepared gourmet dish served on fine porcelain tableware.'}
          </p>

          {/* Highlight badges */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-orange-50/80 border border-orange-100 p-2.5 rounded-xl">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Preparation</span>
              <span className="font-bold text-orange-700">{item.preparationTime || 15} Mins Fresh</span>
            </div>
            <div className="bg-emerald-50/80 border border-emerald-100 p-2.5 rounded-xl">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Calories</span>
              <span className="font-bold text-emerald-700">{item.calories ? `${item.calories} kcal` : 'Chef Prepared'}</span>
            </div>
            <div className="bg-blue-50/80 border border-blue-100 p-2.5 rounded-xl">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Table Style</span>
              <span className="font-bold text-blue-700">Porcelain Rim</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
            <Button
              onClick={onClose}
              className="!h-11 !px-5 !rounded-xl !border-slate-300 !text-slate-600 font-semibold hover:!border-slate-400"
            >
              Back to Menu
            </Button>

            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => {
                onOrder(item);
                onClose();
              }}
              className="flex-1 !h-11 !rounded-xl !bg-gradient-to-r !from-orange-500 !to-amber-500 hover:!from-orange-600 !font-bold !text-sm !shadow-lg !shadow-orange-500/25"
            >
              Add to Table Order &bull; ${item.price.toFixed(2)}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
