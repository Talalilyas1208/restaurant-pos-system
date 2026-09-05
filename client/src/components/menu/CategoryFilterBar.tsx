'use client';

import React, { useRef, useEffect } from 'react';
import { Category, MenuItem } from '../../types';

interface CategoryFilterBarProps {
  categories: Category[];
  menuItems: MenuItem[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const getCategoryEmoji = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('pizza')) return '🍕';
  if (lower.includes('burger')) return '🍔';
  if (lower.includes('drink') || lower.includes('beverage')) return '🍹';
  if (lower.includes('dessert') || lower.includes('sweet')) return '🍰';
  if (lower.includes('pasta') || lower.includes('noodle')) return '🍝';
  if (lower.includes('salad') || lower.includes('soup')) return '🥗';
  if (lower.includes('bbq') || lower.includes('grill')) return '🥩';
  if (lower.includes('breakfast') || lower.includes('egg')) return '🍳';
  if (lower.includes('coffee') || lower.includes('tea')) return '☕';
  if (lower.includes('appetizer') || lower.includes('starter') || lower.includes('snack')) return '🥟';
  return '🍽️';
};

export default function CategoryFilterBar({
  categories,
  menuItems,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the active category button into view when selected
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const activeEl = scrollContainerRef.current.querySelector('[data-active="true"]') as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedCategory]);

  return (
    <div className="sticky top-[152px] sm:top-[160px] z-20 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div
        ref={scrollContainerRef}
        className="px-3.5 py-2.5 overflow-x-auto flex items-center gap-2 no-scrollbar scroll-smooth touch-pan-x"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* 'All' Category Option */}
        <button
          type="button"
          data-active={selectedCategory === 'all'}
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 active:scale-95 ${
            selectedCategory === 'all'
              ? 'bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-400/40'
              : 'bg-white border border-slate-200 text-slate-800 hover:border-orange-300 hover:bg-orange-50/40'
          }`}
        >
          <span>✨</span>
          <span>All Items</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ml-0.5 ${
            selectedCategory === 'all' ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {menuItems.length}
          </span>
        </button>

        {/* Dynamic Categories */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = menuItems.filter((i) => i.categoryId === cat.id).length;
          const emoji = cat.icon || getCategoryEmoji(cat.name);

          return (
            <button
              key={cat.id}
              type="button"
              data-active={isSelected}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-400/40'
                  : 'bg-white border border-slate-200 text-slate-800 hover:border-orange-300 hover:bg-orange-50/40'
              }`}
            >
              <span>{emoji}</span>
              <span>{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ml-0.5 ${
                isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

