'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../../lib/api';
import { MenuItem, SelectedModifier, Order } from '../../../../types';
import ItemModifierModal from '../../../../components/ItemModifierModal';
import {
  Utensils,
  ShoppingBag,
  Sparkles,
  Flame,
  Leaf,
  Plus,
  Minus,
  Check,
  Clock,
  ChevronRight,
  X,
  ChefHat,
  BellRing,
  Info,
} from 'lucide-react';

interface LocalCartItem {
  id: string;
  item: MenuItem;
  quantity: number;
  modifiers: SelectedModifier[];
  instructions: string;
  totalPrice: number;
}

export default function CustomerQRMenuPage() {
  const params = useParams();
  const hotelSlug = (params?.hotelId as string) || 'grand-horizon';
  const tableToken = (params?.tableId as string) || 'gh-tbl-01';

  const queryClient = useQueryClient();

  // Local state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'spicy' | 'special'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<LocalCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItemForMod, setSelectedItemForMod] = useState<MenuItem | null>(null);
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('Table Guest');
  const [tableNotes, setTableNotes] = useState('');
  const [activePlacedOrder, setActivePlacedOrder] = useState<Order | null>(null);

  // Queries
  const { data: hotel } = useQuery({
    queryKey: ['hotel', hotelSlug],
    queryFn: () => api.getHotel(hotelSlug),
  });

  const { data: table } = useQuery({
    queryKey: ['table', tableToken],
    queryFn: () => api.getTableByToken(tableToken),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu-items'],
    queryFn: () => api.getMenuItems(),
  });

  // Track live order status if order was placed
  const { data: liveOrder } = useQuery({
    queryKey: ['order', activePlacedOrder?.id],
    queryFn: () => (activePlacedOrder?.id ? api.getOrder(activePlacedOrder.id) : null),
    enabled: !!activePlacedOrder?.id,
    refetchInterval: 5000, // Poll every 5s for live kitchen status
  });

  const currentOrder = liveOrder || activePlacedOrder;

  // Order mutation
  const createOrderMutation = useMutation({
    mutationFn: (orderPayload: Partial<Order>) => api.createOrder(orderPayload),
    onSuccess: (newOrder) => {
      setActivePlacedOrder(newOrder);
      setCartItems([]);
      setIsCartOpen(false);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  // Filter items
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

  const handleAddItem = (item: MenuItem) => {
    if (item.modifiers && item.modifiers.length > 0) {
      setSelectedItemForMod(item);
      setIsModifierModalOpen(true);
    } else {
      handleAddDirect(item, 1, [], '');
    }
  };

  const handleAddDirect = (
    item: MenuItem,
    quantity: number,
    modifiers: SelectedModifier[],
    instructions: string
  ) => {
    const modTotal = modifiers.reduce((sum, m) => sum + m.price, 0);
    const unitPrice = item.price + modTotal;
    const keyMods = modifiers.map((m) => `${m.groupName}:${m.optionName}`).sort().join('|');
    const id = `${item.id}-${keyMods}-${instructions}`;

    setCartItems((prev) => {
      const idx = prev.findIndex((ci) => ci.id === id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += quantity;
        updated[idx].totalPrice = updated[idx].quantity * unitPrice;
        return updated;
      }
      return [
        ...prev,
        {
          id,
          item,
          quantity,
          modifiers,
          instructions,
          totalPrice: unitPrice * quantity,
        },
      ];
    });
  };

  const totalCartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, i) => sum + i.totalPrice, 0);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;

    const payload: Partial<Order> = {
      hotelId: hotel?.id,
      tableId: table?.id,
      tableNumber: table?.tableNumber || 'Table 1',
      orderType: 'dine_in',
      source: 'qr_customer',
      customerName,
      customerNotes: tableNotes,
      items: cartItems.map((ci) => ({
        menuItemId: ci.item.id,
        name: ci.item.name,
        unitPrice: ci.totalPrice / ci.quantity,
        quantity: ci.quantity,
        totalPrice: ci.totalPrice,
        selectedModifiers: ci.modifiers,
        specialInstructions: ci.instructions,
      })),
    };

    createOrderMutation.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col max-w-lg mx-auto pb-28 border-x border-slate-900 shadow-2xl relative">
      {/* Top Welcome Header */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-5 space-y-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white leading-tight">
                {hotel?.name || 'Grand Horizon Bistro'}
              </h1>
              <p className="text-xs text-orange-400 font-medium">Digital Dine-in Menu</p>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Table {table?.tableNumber || 'T-01'}</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search our gourmet dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Dietary Quick Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 text-xs">
          <button
            onClick={() => setDietaryFilter('all')}
            className={`px-3 py-1.5 rounded-full font-medium transition-all ${
              dietaryFilter === 'all'
                ? 'bg-white text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            All Dishes
          </button>
          <button
            onClick={() => setDietaryFilter('veg')}
            className={`px-3 py-1.5 rounded-full font-medium flex items-center gap-1 transition-all ${
              dietaryFilter === 'veg'
                ? 'bg-emerald-500 text-white font-bold'
                : 'bg-slate-800 text-emerald-400 border border-slate-700'
            }`}
          >
            <Leaf className="w-3.5 h-3.5" /> Vegetarian
          </button>
          <button
            onClick={() => setDietaryFilter('spicy')}
            className={`px-3 py-1.5 rounded-full font-medium flex items-center gap-1 transition-all ${
              dietaryFilter === 'spicy'
                ? 'bg-rose-600 text-white font-bold'
                : 'bg-slate-800 text-rose-400 border border-slate-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Spicy
          </button>
          <button
            onClick={() => setDietaryFilter('special')}
            className={`px-3 py-1.5 rounded-full font-medium flex items-center gap-1 transition-all ${
              dietaryFilter === 'special'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-amber-400 border border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Chef Special
          </button>
        </div>
      </div>

      {/* Live Order Tracker Banner (If an order was placed by guest) */}
      {currentOrder && (
        <div className="m-4 p-4 rounded-2xl bg-gradient-to-r from-orange-950/60 to-slate-900 border border-orange-500/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-orange-400 animate-bounce" />
              <span className="font-bold text-sm text-white">Live Kitchen Tracker</span>
            </div>
            <span className="text-xs bg-orange-500/20 text-orange-300 font-bold px-2 py-0.5 rounded-full">
              {currentOrder.orderNumber}
            </span>
          </div>

          {/* Stepper Progress */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div
              className={`p-2 rounded-xl border ${
                currentOrder.status === 'pending' || currentOrder.status === 'preparing' || currentOrder.status === 'ready'
                  ? 'bg-orange-500/20 border-orange-500 text-orange-200 font-semibold'
                  : 'bg-slate-800/40 border-slate-800 text-slate-500'
              }`}
            >
              1. Received ⏱️
            </div>
            <div
              className={`p-2 rounded-xl border ${
                currentOrder.status === 'preparing' || currentOrder.status === 'ready'
                  ? 'bg-orange-500/20 border-orange-500 text-orange-200 font-semibold'
                  : 'bg-slate-800/40 border-slate-800 text-slate-500'
              }`}
            >
              2. Cooking 🍳
            </div>
            <div
              className={`p-2 rounded-xl border ${
                currentOrder.status === 'ready' || currentOrder.status === 'served'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-semibold'
                  : 'bg-slate-800/40 border-slate-800 text-slate-500'
              }`}
            >
              3. Ready 🍽️
            </div>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Your dishes are being prepared fresh in the kitchen.
          </p>
        </div>
      )}

      {/* Category Horizontal Navigation */}
      <div className="sticky top-16 z-20 bg-slate-950/95 backdrop-blur px-4 py-2.5 border-b border-slate-800/80 overflow-x-auto flex gap-2 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Items List */}
      <div className="p-4 space-y-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 flex gap-4 shadow-lg hover:border-slate-700 transition-all"
          >
            {/* Left Info */}
            <div className="flex-1 flex flex-col justify-between space-y-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  {item.isVeg && <Leaf className="w-3.5 h-3.5 text-emerald-400" />}
                  {item.isSpicy && <Flame className="w-3.5 h-3.5 text-rose-500" />}
                  {item.isChefSpecial && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                  <h3 className="font-bold text-sm text-slate-100">{item.name}</h3>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="font-extrabold text-base text-white">
                  ${item.price.toFixed(2)}
                </span>
                <button
                  onClick={() => handleAddItem(item)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Right Image */}
            {item.imageUrl && (
              <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Floating Bottom Cart Bar */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 text-white font-bold py-3.5 px-5 rounded-2xl shadow-2xl shadow-orange-500/40 flex items-center justify-between transition-all transform active:scale-95"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-black/30 flex items-center justify-center text-xs">
                {totalCartCount}
              </span>
              <span className="text-sm">View Cart / Checkout</span>
            </div>
            <div className="flex items-center gap-1 text-base">
              <span>${cartSubtotal.toFixed(2)}</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        </div>
      )}

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-white animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-400" />
                <span className="font-bold text-base">Your Table Order</span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {cartItems.map((ci, idx) => (
                <div key={idx} className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-100">{ci.item.name}</h4>
                      {ci.modifiers.length > 0 && (
                        <p className="text-[11px] text-orange-300">
                          {ci.modifiers.map((m) => m.optionName).join(', ')}
                        </p>
                      )}
                      {ci.instructions && (
                        <p className="text-[11px] text-slate-400 italic">&ldquo;{ci.instructions}&rdquo;</p>
                      )}
                    </div>
                    <span className="font-bold text-sm text-white">${ci.totalPrice.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-700/40 text-xs">
                    <span className="text-slate-400">Qty: {ci.quantity}</span>
                    <button
                      onClick={() => setCartItems((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-rose-400 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {/* Guest name & notes */}
              <div className="space-y-2 pt-2">
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500"
                />
                <textarea
                  placeholder="Special instructions for kitchen..."
                  value={tableNotes}
                  onChange={(e) => setTableNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 resize-none"
                />
              </div>
            </div>

            {/* Cart Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/90 space-y-3">
              <div className="flex justify-between font-bold text-base">
                <span>Total Amount</span>
                <span className="text-orange-400">${cartSubtotal.toFixed(2)}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={createOrderMutation.isPending}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
              >
                <ChefHat className="w-5 h-5" />
                <span>{createOrderMutation.isPending ? 'Sending to Kitchen...' : 'Send Order to Kitchen'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modifier Modal */}
      <ItemModifierModal
        item={selectedItemForMod}
        isOpen={isModifierModalOpen}
        onClose={() => setIsModifierModalOpen(false)}
        onConfirm={(payload) => {
          handleAddDirect(payload.item, payload.quantity, payload.modifiers, payload.instructions);
        }}
      />
    </div>
  );
}
