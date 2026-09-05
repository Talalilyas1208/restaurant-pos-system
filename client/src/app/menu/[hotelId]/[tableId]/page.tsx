'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { message } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { api } from '../../../../lib/api';
import { MenuItem } from '../../../../types';
import FoodTablePreviewModal from '../../../../components/FoodTablePreviewModal';
import ItemModifierModal from '../../../../components/ItemModifierModal';
import LiveOrderTracker from '../../../../components/order/LiveOrderTracker';
import MenuHeader from '../../../../components/menu/MenuHeader';
import CategoryFilterBar from '../../../../components/menu/CategoryFilterBar';
import MenuItemCard from '../../../../components/menu/MenuItemCard';
import FloatingCartBar from '../../../../components/menu/FloatingCartBar';
import CartCheckoutDrawer from '../../../../components/menu/CartCheckoutDrawer';
import { useTableCart } from '../../../../hooks/useTableCart';

export default function CustomerQRMenuPage() {
  const params = useParams();
  const hotelSlug = (params?.hotelId as string) || 'pos-project';
  const tableToken = (params?.tableId as string) || 'gh-tbl-01';

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dietaryFilter, setDietaryFilter] = useState<string>('all');

  // Preview & Modifiers Modals
  const [previewItem, setPreviewItem] = useState<MenuItem | null>(null);
  const [selectedModItem, setSelectedModItem] = useState<MenuItem | null>(null);

  // Cart & Order State via Reusable Hook
  const cart = useTableCart();

  // Queries
  const { data: hotel } = useQuery({ queryKey: ['hotel', hotelSlug], queryFn: () => api.getHotel(hotelSlug) });
  const { data: table } = useQuery({ queryKey: ['table', tableToken], queryFn: () => api.getTableByToken(tableToken) });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => api.getCategories() });
  const { data: menuItems = [] } = useQuery({ queryKey: ['menu-items'], queryFn: () => api.getMenuItems() });

  const { data: liveOrder } = useQuery({
    queryKey: ['order', cart.activePlacedOrder?.id],
    queryFn: () => (cart.activePlacedOrder?.id ? api.getOrder(cart.activePlacedOrder.id) : null),
    enabled: !!cart.activePlacedOrder?.id,
    refetchInterval: 5000,
  });

  const filteredItems = menuItems.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesDietary = true;
    if (dietaryFilter === 'veg') matchesDietary = item.isVeg;
    if (dietaryFilter === 'spicy') matchesDietary = item.isSpicy;
    if (dietaryFilter === 'special') matchesDietary = item.isChefSpecial;

    return matchesCat && matchesSearch && matchesDietary;
  });

  const handleSelectItem = (item: MenuItem) => {
    if (item.modifiers && item.modifiers.length > 0) {
      setSelectedModItem(item);
    } else {
      cart.addDirect(item, 1, [], '');
    }
  };

  const handleCallWaiter = () => {
    message.success({
      content: `Waiter called for Table ${table?.tableNumber || 'T-01'}. Staff is on the way!`,
      icon: <BellOutlined className="text-orange-500" />,
      duration: 3,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col max-w-lg mx-auto pb-32 border-x border-slate-200/80 shadow-2xl relative">
      <MenuHeader
        hotel={hotel}
        table={table}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        dietaryFilter={dietaryFilter}
        onDietaryChange={setDietaryFilter}
        onCallWaiter={handleCallWaiter}
      />

      <LiveOrderTracker
        order={cart.activePlacedOrder || liveOrder}
        tableNumber={table?.tableNumber}
        onCallWaiter={handleCallWaiter}
        className="m-4"
      />

      <CategoryFilterBar
        categories={categories}
        menuItems={menuItems}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div className="p-4 space-y-3.5">
        {filteredItems.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            currencySymbol={hotel?.currencySymbol || '$'}
            onSelect={handleSelectItem}
            onPreview={(it, e) => {
              e.stopPropagation();
              setPreviewItem(it);
            }}
          />
        ))}
      </div>

      <FloatingCartBar
        totalCount={cart.totalCount}
        subtotal={cart.subtotal}
        currencySymbol={hotel?.currencySymbol || '$'}
        onOpenCart={() => cart.setIsCartOpen(true)}
      />

      <CartCheckoutDrawer
        isOpen={cart.isCartOpen}
        onClose={() => cart.setIsCartOpen(false)}
        tableNumber={table?.tableNumber}
        cartItems={cart.cartItems}
        onRemoveItem={cart.removeItem}
        customerName={cart.customerName}
        onCustomerNameChange={cart.setCustomerName}
        tableNotes={cart.tableNotes}
        onTableNotesChange={cart.setTableNotes}
        currencySymbol={hotel?.currencySymbol || '$'}
        cartSubtotal={cart.subtotal}
        hotelName={hotel?.name}
        paymentMethod={cart.paymentMethod}
        onPaymentMethodChange={cart.setPaymentMethod}
        cardState={cart.cardState}
        onCardChange={cart.setCardState}
        easypaisaState={cart.easypaisaState}
        onEasypaisaChange={cart.setEasypaisaState}
        jazzcashState={cart.jazzcashState}
        onJazzcashChange={cart.setJazzcashState}
        onPlaceOrder={() => cart.checkout(hotel?.id || '', table?.id, table?.tableNumber)}
        isSyncing={cart.isSyncing}
      />

      <FoodTablePreviewModal
        item={previewItem}
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        onOrder={handleSelectItem}
      />

      <ItemModifierModal
        item={selectedModItem}
        isOpen={!!selectedModItem}
        onClose={() => setSelectedModItem(null)}
        onConfirm={(payload) =>
          cart.addDirect(payload.item, payload.quantity, payload.modifiers, payload.instructions)
        }
      />
    </div>
  );
}
