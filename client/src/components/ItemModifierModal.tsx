'use client';

import React, { useState } from 'react';
import { Modal, Radio, Checkbox, Input, InputNumber, Button, Tag, Space, Typography, Divider } from 'antd';
import { PlusOutlined, MinusOutlined, ShoppingCartOutlined, FireOutlined } from '@ant-design/icons';
import { MenuItem, SelectedModifier } from '../types';

const { Text, Paragraph } = Typography;
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
    // Reset state
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
      className="ant-modal-luxury"
      title={
        <div className="flex items-center justify-between pr-6">
          <span className="font-bold text-lg text-slate-100">{item.name}</span>
          <Tag color="orange" className="!text-sm !font-bold">
            ${item.price.toFixed(2)}
          </Tag>
        </div>
      }
    >
      <div className="space-y-4 pt-2">
        {/* Item Image */}
        {item.imageUrl && (
          <div className="h-44 w-full rounded-2xl overflow-hidden relative shadow-inner">
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            <div className="absolute top-2 left-2 flex gap-1.5">
              {item.isChefSpecial && <Tag color="gold">Chef Special</Tag>}
              {item.isSpicy && <Tag color="error">Spicy</Tag>}
              {item.isVeg && <Tag color="success">Vegetarian</Tag>}
            </div>
          </div>
        )}

        {/* Description */}
        {item.description && (
          <Paragraph className="!text-slate-300 !text-sm leading-relaxed !mb-2">
            {item.description}
          </Paragraph>
        )}

        {/* Modifiers List */}
        {item.modifiers && item.modifiers.length > 0 ? (
          item.modifiers.map((modGroup) => {
            const isSingleSelect = modGroup.maxSelection === 1;
            const currentSelectedInGroup = selectedModifiers.find((m) => m.groupName === modGroup.name);

            return (
              <div
                key={modGroup.id}
                className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-200">
                    {modGroup.name}{' '}
                    {modGroup.isRequired ? (
                      <Tag color="error" className="!text-[10px]">Required</Tag>
                    ) : (
                      <Tag color="default" className="!text-[10px]">Optional</Tag>
                    )}
                  </span>
                  <span className="text-xs text-slate-400">
                    {isSingleSelect ? 'Choose 1 option' : `Select up to ${modGroup.maxSelection}`}
                  </span>
                </div>

                {isSingleSelect ? (
                  <Radio.Group
                    className="w-full space-y-2"
                    value={currentSelectedInGroup?.optionName}
                    onChange={(e) => {
                      const opt = modGroup.options.find((o) => o.name === e.target.value);
                      if (opt) handleSingleSelect(modGroup.name, opt.name, opt.price);
                    }}
                  >
                    <Space direction="vertical" className="w-full">
                      {modGroup.options.map((opt) => (
                        <div
                          key={opt.name}
                          className="flex items-center justify-between bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60 hover:border-orange-500/50 cursor-pointer"
                          onClick={() => handleSingleSelect(modGroup.name, opt.name, opt.price)}
                        >
                          <Radio value={opt.name} className="!text-slate-200 !text-sm">
                            {opt.name}
                          </Radio>
                          <span className="text-xs font-semibold text-orange-400">
                            {opt.price > 0 ? `+$${opt.price.toFixed(2)}` : 'Included'}
                          </span>
                        </div>
                      ))}
                    </Space>
                  </Radio.Group>
                ) : (
                  <Space direction="vertical" className="w-full">
                    {modGroup.options.map((opt) => {
                      const isChecked = selectedModifiers.some(
                        (m) => m.groupName === modGroup.name && m.optionName === opt.name
                      );
                      return (
                        <div
                          key={opt.name}
                          className="flex items-center justify-between bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60 hover:border-orange-500/50"
                        >
                          <Checkbox
                            checked={isChecked}
                            onChange={(e) =>
                              handleMultiSelect(modGroup.name, opt.name, opt.price, e.target.checked)
                            }
                            className="!text-slate-200 !text-sm"
                          >
                            {opt.name}
                          </Checkbox>
                          <span className="text-xs font-semibold text-orange-400">
                            {opt.price > 0 ? `+$${opt.price.toFixed(2)}` : 'Included'}
                          </span>
                        </div>
                      );
                    })}
                  </Space>
                )}
              </div>
            );
          })
        ) : null}

        {/* Special Instructions */}
        <div className="space-y-1.5">
          <Text className="!text-xs !font-semibold !text-slate-300 uppercase tracking-wider">
            Special Kitchen Notes
          </Text>
          <TextArea
            rows={2}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g., Dressing on the side, extra crispy, sauce separate..."
            className="!bg-slate-800/90 !border-slate-700 !rounded-xl !text-slate-200"
          />
        </div>

        <Divider className="!border-slate-800 !my-3" />

        {/* Footer Quantity & Add to Cart */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Quantity:</span>
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1">
              <Button
                size="small"
                type="text"
                icon={<MinusOutlined />}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="!text-slate-300 hover:!text-white"
              />
              <span className="w-8 text-center font-bold text-sm text-white">{quantity}</span>
              <Button
                size="small"
                type="text"
                icon={<PlusOutlined />}
                onClick={() => setQuantity((q) => q + 1)}
                className="!text-slate-300 hover:!text-white"
              />
            </div>
          </div>

          <Button
            type="primary"
            size="large"
            icon={<ShoppingCartOutlined />}
            onClick={handleConfirm}
            className="!bg-gradient-to-r !from-orange-500 !to-amber-600 hover:!from-orange-600 hover:!to-amber-700 !font-bold !h-12 !px-6 !rounded-xl !shadow-lg !shadow-orange-500/25"
          >
            Add to Order &bull; ${totalPrice.toFixed(2)}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
