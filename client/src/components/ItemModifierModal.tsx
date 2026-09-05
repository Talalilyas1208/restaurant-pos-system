'use client';

import React, { useState } from 'react';
import { Modal, Input, Button, Tag, Typography, Divider } from 'antd';
import { PlusOutlined, MinusOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { MenuItem, SelectedModifier } from '../types';
import ModifierGroupItem from './menu/ModifierGroupItem';

const { Paragraph } = Typography;
const { TextArea } = Input;

interface ItemModifierModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: { item: MenuItem; quantity: number; modifiers: SelectedModifier[]; instructions: string }) => void;
}

export default function ItemModifierModal({ item, isOpen, onClose, onConfirm }: ItemModifierModalProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifier[]>([]);
  const [instructions, setInstructions] = useState('');

  if (!isOpen || !item) return null;

  const handleSingleSelect = (groupName: string, optionName: string, price: number) => {
    setSelectedModifiers((prev) => [
      ...prev.filter((m) => m.groupName !== groupName),
      { groupName, optionName, price },
    ]);
  };

  const handleMultiSelect = (groupName: string, optionName: string, price: number, checked: boolean) => {
    if (checked) {
      setSelectedModifiers((prev) => [...prev, { groupName, optionName, price }]);
    } else {
      setSelectedModifiers((prev) =>
        prev.filter((m) => !(m.groupName === groupName && m.optionName === optionName))
      );
    }
  };

  const modifiersTotal = selectedModifiers.reduce((sum, m) => sum + m.price, 0);
  const unitPrice = item.price + modifiersTotal;
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    onConfirm({
      item,
      quantity,
      modifiers: selectedModifiers,
      instructions,
    });
    onClose();
    setQuantity(1);
    setSelectedModifiers([]);
    setInstructions('');
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={540}
      centered
      styles={{ body: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24 } }}
      title={
        <div className="flex items-center justify-between pr-6">
          <span className="font-black text-lg text-slate-900">{item.name}</span>
          <Tag color="orange" className="!text-sm !font-black !rounded-md">
            ${item.price.toFixed(2)}
          </Tag>
        </div>
      }
    >
      <div className="space-y-4 pt-2 text-slate-900">
        {/* Item Image */}
        {item.imageUrl && (
          <div className="h-44 w-full rounded-2xl overflow-hidden relative shadow-xs bg-slate-100 border border-slate-200 flex items-center justify-center">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute top-2 left-2 flex gap-1.5">
              {item.isChefSpecial && <Tag color="gold" className="!font-bold !rounded-md">Chef Special</Tag>}
              {item.isSpicy && <Tag color="error" className="!font-bold !rounded-md">Spicy</Tag>}
              {item.isVeg && <Tag color="success" className="!font-bold !rounded-md">Vegetarian</Tag>}
            </div>
          </div>
        )}

        {/* Description */}
        {item.description && (
          <Paragraph className="!text-slate-600 !text-sm leading-relaxed !mb-2">
            {item.description}
          </Paragraph>
        )}

        {/* Modifiers List */}
        {item.modifiers && item.modifiers.length > 0 ? (
          item.modifiers.map((modGroup) => (
            <ModifierGroupItem
              key={modGroup.id}
              modGroup={modGroup}
              selectedModifiers={selectedModifiers}
              onSingleSelect={handleSingleSelect}
              onMultiSelect={handleMultiSelect}
            />
          ))
        ) : null}

        {/* Special Instructions */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 block">Special Instructions</label>
          <TextArea
            rows={2}
            placeholder="e.g. No onions, sauce on the side..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="!rounded-xl font-medium"
          />
        </div>

        <Divider className="!border-slate-200 !my-3" />

        {/* Bottom CTA */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <Button
              size="small"
              type="text"
              icon={<MinusOutlined />}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="!text-slate-700 font-bold"
            />
            <span className="w-8 text-center text-sm font-black text-slate-900">{quantity}</span>
            <Button
              size="small"
              type="text"
              icon={<PlusOutlined />}
              onClick={() => setQuantity((q) => q + 1)}
              className="!text-slate-700 font-bold"
            />
          </div>

          <Button
            type="primary"
            size="large"
            icon={<ShoppingCartOutlined />}
            onClick={handleConfirm}
            className="!h-11 !px-6 !rounded-xl !bg-gradient-to-r !from-orange-500 via-rose-500 to-amber-500 hover:!opacity-95 !font-black !text-sm !shadow-md border-0 text-white"
          >
            Add to Order &bull; ${totalPrice.toFixed(2)}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
