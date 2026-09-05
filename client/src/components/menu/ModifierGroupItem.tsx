'use client';

import React from 'react';
import { Radio, Checkbox, Tag, Space } from 'antd';
import { ItemModifier, ItemModifierOption, SelectedModifier } from '../../types';

interface ModifierGroupItemProps {
  modGroup: ItemModifier;
  selectedModifiers: SelectedModifier[];
  onSingleSelect: (groupName: string, optionName: string, price: number) => void;
  onMultiSelect: (groupName: string, optionName: string, price: number, checked: boolean) => void;
}

export default function ModifierGroupItem({
  modGroup,
  selectedModifiers,
  onSingleSelect,
  onMultiSelect,
}: ModifierGroupItemProps) {
  const isSingleSelect = modGroup.maxSelection === 1;
  const currentSelectedInGroup = selectedModifiers.find((m) => m.groupName === modGroup.name);

  return (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="font-black text-sm text-slate-900">
          {modGroup.name}{' '}
          {modGroup.isRequired ? (
            <Tag color="error" className="!text-[10px] !font-bold !rounded-md">Required</Tag>
          ) : (
            <Tag color="default" className="!text-[10px] !rounded-md">Optional</Tag>
          )}
        </span>
        <span className="text-xs text-slate-500 font-semibold">
          {isSingleSelect ? 'Choose 1 option' : `Select up to ${modGroup.maxSelection}`}
        </span>
      </div>

      {isSingleSelect ? (
        <Radio.Group
          className="w-full space-y-2"
          value={currentSelectedInGroup?.optionName}
          onChange={(e) => {
            const opt = modGroup.options.find((o: ItemModifierOption) => o.name === e.target.value);
            if (opt) onSingleSelect(modGroup.name, opt.name, opt.price);
          }}
        >
          <Space direction="vertical" className="w-full">
            {modGroup.options.map((opt: ItemModifierOption) => (
              <div
                key={opt.name}
                className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 hover:border-orange-400 cursor-pointer shadow-xs"
                onClick={() => onSingleSelect(modGroup.name, opt.name, opt.price)}
              >
                <Radio value={opt.name} className="!text-slate-800 !text-sm font-bold">
                  {opt.name}
                </Radio>
                <span className="text-xs font-black text-orange-600">
                  {opt.price > 0 ? `+$${opt.price.toFixed(2)}` : 'Included'}
                </span>
              </div>
            ))}
          </Space>
        </Radio.Group>
      ) : (
        <Space direction="vertical" className="w-full">
          {modGroup.options.map((opt: ItemModifierOption) => {
            const isChecked = selectedModifiers.some(
              (m) => m.groupName === modGroup.name && m.optionName === opt.name
            );
            return (
              <div
                key={opt.name}
                className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 hover:border-orange-400 shadow-xs"
              >
                <Checkbox
                  checked={isChecked}
                  onChange={(e) =>
                    onMultiSelect(modGroup.name, opt.name, opt.price, e.target.checked)
                  }
                  className="!text-slate-800 !text-sm font-bold"
                >
                  {opt.name}
                </Checkbox>
                <span className="text-xs font-black text-orange-600">
                  {opt.price > 0 ? `+$${opt.price.toFixed(2)}` : 'Included'}
                </span>
              </div>
            );
          })}
        </Space>
      )}
    </div>
  );
}

