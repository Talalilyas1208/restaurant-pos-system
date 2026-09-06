'use client';

import React from 'react';
import { Tabs } from 'antd';
import { Category, MenuItem } from '../../types';
import { MenuItemCard, EmptyState } from '../ui';
import { CartItem } from '../../store/slices/cartSlice';

interface POSCatalogViewProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  menuItemsCount: number;
  filteredItems: MenuItem[];
  cartItems: CartItem[];
  onItemClick: (item: MenuItem) => void;
}

export default function POSCatalogView({
  categories,
  selectedCategoryId,
  onSelectCategory,
  menuItemsCount,
  filteredItems,
  cartItems,
  onItemClick,
}: POSCatalogViewProps) {
  const categoryTabItems = [
    { key: 'all', label: `All Items (${menuItemsCount})` },
    ...categories.map((c) => ({
      key: c.id,
      label: c.name,
    })),
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Category Tabs */}
      <div className="px-4 bg-white border-b border-slate-200">
        <Tabs
          activeKey={selectedCategoryId}
          onChange={onSelectCategory}
          items={categoryTabItems}
          className="custom-antd-tabs"
        />
      </div>

      {/* Menu Items Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <EmptyState
            title="No dishes found"
            description="Try adjusting your category filter or search query."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => {
              const inCartCount = cartItems
                .filter((i) => i.menuItemId === item.id)
                .reduce((sum, i) => sum + i.quantity, 0);

              return (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onSelect={onItemClick}
                  inCartQuantity={inCartCount}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

