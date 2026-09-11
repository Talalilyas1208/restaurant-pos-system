'use client';

import React, { useState } from 'react';
import { Modal, Tag, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Clock } from 'lucide-react';
import { MenuItem } from '../types';
import FoodTableVisualPlate, { LightingMode } from './food/FoodTableVisualPlate';

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
  const [lighting, setLighting] = useState<LightingMode>('daylight');

  if (!item) return null;

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
        <FoodTableVisualPlate
          item={item}
          lighting={lighting}
          onLightingChange={setLighting}
        />

        {/* Dish Info & Ordering Section */}
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

          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            {item.description || 'Artisanal freshly prepared gourmet dish served on fine porcelain tableware.'}
          </p>

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
