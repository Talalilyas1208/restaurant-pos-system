'use client';

import React, { useState } from 'react';
import { MenuItem, SelectedModifier } from '../types';
import { X, Plus, Minus, Check } from 'lucide-react';

interface ItemModifierModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: { item: MenuItem; quantity: number; modifiers: SelectedModifier[]; instructions: string }) => void;
}

export default function ItemModifierModal({ item, isOpen, onClose, onConfirm }: ItemModifierModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifier[]>([]);
  const [instructions, setInstructions] = useState('');

  if (!isOpen || !item) return null;

  const handleModifierToggle = (groupName: string, optionName: string, price: number, isSingleSelect: boolean) => {
    if (isSingleSelect) {
      setSelectedModifiers((prev) => [
        ...prev.filter((m) => m.groupName !== groupName),
        { groupName, optionName, price },
      ]);
    } else {
      const exists = selectedModifiers.some((m) => m.groupName === groupName && m.optionName === optionName);
      if (exists) {
        setSelectedModifiers((prev) =>
          prev.filter((m) => !(m.groupName === groupName && m.optionName === optionName))
        );
      } else {
        setSelectedModifiers((prev) => [...prev, { groupName, optionName, price }]);
      }
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
    // Reset
    setQuantity(1);
    setSelectedModifiers([]);
    setInstructions('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-white">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-100">{item.name}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {item.imageUrl && (
            <div className="h-44 w-full rounded-xl overflow-hidden relative">
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur text-sm font-bold text-amber-400">
                ${item.price.toFixed(2)}
              </div>
            </div>
          )}

          {item.description && <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>}

          {/* Modifiers List */}
          {item.modifiers && item.modifiers.length > 0 ? (
            item.modifiers.map((modGroup) => {
              const isSingleSelect = modGroup.maxSelection === 1;
              return (
                <div key={modGroup.id} className="space-y-2 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-200">
                      {modGroup.name}{' '}
                      {modGroup.isRequired && <span className="text-rose-400 text-xs">(Required)</span>}
                    </span>
                    <span className="text-xs text-slate-400">
                      {isSingleSelect ? 'Choose 1' : `Max ${modGroup.maxSelection}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {modGroup.options.map((opt) => {
                      const isSelected = selectedModifiers.some(
                        (m) => m.groupName === modGroup.name && m.optionName === opt.name
                      );
                      return (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => handleModifierToggle(modGroup.name, opt.name, opt.price, isSingleSelect)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all border ${
                            isSelected
                              ? 'bg-orange-500/20 border-orange-500 text-orange-200'
                              : 'bg-slate-800/80 border-slate-700 hover:border-slate-600 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                                isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-600'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                            <span>{opt.name}</span>
                          </div>
                          <span className="font-medium text-slate-200">
                            {opt.price > 0 ? `+$${opt.price.toFixed(2)}` : 'Included'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-slate-400 italic">No customizable modifiers for this item.</div>
          )}

          {/* Special Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Special Kitchen Notes
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g., Dressing on the side, extra crispy, allergy note..."
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>
        </div>

        {/* Footer with Quantity & Add Button */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-4">
          <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 p-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-lg bg-slate-700/60 hover:bg-slate-700 flex items-center justify-center text-slate-200"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-bold text-sm text-slate-100">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-lg bg-slate-700/60 hover:bg-slate-700 flex items-center justify-center text-slate-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold py-3 px-5 rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-between transition-all"
          >
            <span>Add to Order</span>
            <span>${totalPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
