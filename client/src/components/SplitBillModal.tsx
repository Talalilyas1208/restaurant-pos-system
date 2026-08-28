'use client';

import React, { useState } from 'react';
import { X, Users, Split } from 'lucide-react';

interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  currencySymbol?: string;
  onSettleSplit: (shares: number[]) => void;
}

export default function SplitBillModal({
  isOpen,
  onClose,
  totalAmount,
  currencySymbol = '$',
  onSettleSplit,
}: SplitBillModalProps) {
  const [splitCount, setSplitCount] = useState(2);
  const [customSplits, setCustomSplits] = useState<number[]>([]);
  const [mode, setMode] = useState<'equal' | 'custom'>('equal');

  if (!isOpen) return null;

  const equalShare = totalAmount > 0 ? parseFloat((totalAmount / splitCount).toFixed(2)) : 0;

  const handleEqualSettle = () => {
    const shares = Array(splitCount).fill(equalShare);
    onSettleSplit(shares);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-orange-400">
            <Split className="w-5 h-5" />
            <span className="font-semibold text-base">Split Bill Calculation</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 text-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Total Bill Amount</span>
            <div className="text-3xl font-bold text-white pt-1">
              {currencySymbol}
              {totalAmount.toFixed(2)}
            </div>
          </div>

          {/* Equal split selector */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-400" />
              <span>Split Between People</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSplitCount(num)}
                  className={`py-3 rounded-xl font-bold text-base transition-all border ${
                    splitCount === num
                      ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {num}x
                </button>
              ))}
            </div>
          </div>

          {/* Result Card */}
          <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Each Person Pays:</span>
              <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-medium">
                {splitCount} Equal Parts
              </span>
            </div>
            <div className="text-2xl font-bold text-orange-400">
              {currencySymbol}
              {equalShare.toFixed(2)}{' '}
              <span className="text-xs text-slate-400 font-normal">/ person</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleEqualSettle}
            className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 transition-all"
          >
            Accept & Proceed
          </button>
        </div>
      </div>
    </div>
  );
}
