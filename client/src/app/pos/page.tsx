'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  setTable,
  setDiscount,
  setCustomerInfo,
  setOrderType,
} from '../../store/slices/cartSlice';
import { api } from '../../lib/api';
import { MenuItem, DiningTable, SelectedModifier, Order } from '../../types';
import ItemModifierModal from '../../components/ItemModifierModal';
import SplitBillModal from '../../components/SplitBillModal';
import ReceiptModal from '../../components/ReceiptModal';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  CreditCard,
  Banknote,
  Building,
  Split,
  Utensils,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  Leaf,
  Filter,
} from 'lucide-react';

export default function POSTerminalPage() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const cart = useSelector((state: RootState) => state.cart);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'menu' | 'tables'>('menu');

  // Modals state
  const [selectedItemForMod, setSelectedItemForMod] = useState<MenuItem | null>(null);
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit_card' | 'room_charge'>('cash');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [roomNumber, setRoomNumber] = useState('');
  const [lastPaidOrder, setLastPaidOrder] = useState<Order | null>(null);

  // Queries
  const { data: hotel } = useQuery({
    queryKey: ['hotel'],
    queryFn: () => api.getHotel(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu-items'],
    queryFn: () => api.getMenuItems(),
  });

  const { data: tables = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: () => api.getTables(),
  });

  // Mutations
  const createOrderMutation = useMutation({
    mutationFn: (orderPayload: Partial<Order>) => api.createOrder(orderPayload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const processPaymentMutation = useMutation({
    mutationFn: (payPayload: any) => api.processPayment(payPayload),
    onSuccess: (data) => {
      setLastPaidOrder(data.order);
      setIsPaymentModalOpen(false);
      setIsReceiptModalOpen(true);
      dispatch(clearCart());
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  // Filtered menu items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategoryId === 'all' || item.categoryId === selectedCategoryId;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Cart calculations
  const subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxRate = hotel?.taxRate || 8.5;
  const serviceChargeRate = hotel?.serviceChargeRate || 5.0;
  const discountAmount = parseFloat(((subtotal * cart.discountPercent) / 100).toFixed(2));
  const tax = parseFloat(((subtotal * taxRate) / 100).toFixed(2));
  const serviceCharge = parseFloat(((subtotal * serviceChargeRate) / 100).toFixed(2));
  const grandTotal = Math.max(0, parseFloat((subtotal + tax + serviceCharge - discountAmount).toFixed(2)));

  const handleItemClick = (item: MenuItem) => {
    if (item.modifiers && item.modifiers.length > 0) {
      setSelectedItemForMod(item);
      setIsModifierModalOpen(true);
    } else {
      dispatch(addToCart({ item }));
    }
  };

  const handleModifierConfirm = (payload: {
    item: MenuItem;
    quantity: number;
    modifiers: SelectedModifier[];
    instructions: string;
  }) => {
    dispatch(
      addToCart({
        item: payload.item,
        quantity: payload.quantity,
        modifiers: payload.modifiers,
        instructions: payload.instructions,
      })
    );
  };

  const handleSelectTable = (tbl: DiningTable) => {
    dispatch(setTable({ tableId: tbl.id, tableNumber: tbl.tableNumber }));
    setActiveTab('menu');
  };

  const handleCheckoutClick = () => {
    if (cart.items.length === 0) return;
    setCashTendered(grandTotal);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    try {
      // 1. Create order
      const orderPayload: Partial<Order> = {
        hotelId: hotel?.id,
        tableId: cart.tableId || undefined,
        tableNumber: cart.tableNumber || (cart.orderType === 'room_service' ? `Room ${roomNumber}` : 'Takeaway'),
        orderType: cart.orderType,
        source: 'pos',
        customerName: cart.customerName || 'Guest',
        customerNotes: cart.customerNotes,
        discountAmount,
        items: cart.items.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
          totalPrice: i.totalPrice,
          selectedModifiers: i.selectedModifiers,
          specialInstructions: i.specialInstructions,
        })),
      };

      const createdOrder = await createOrderMutation.mutateAsync(orderPayload);

      // 2. Process payment
      await processPaymentMutation.mutateAsync({
        orderId: createdOrder.id,
        hotelId: hotel?.id || '',
        paymentMethod,
        amount: grandTotal,
        tenderedAmount: paymentMethod === 'cash' ? cashTendered : grandTotal,
        changeDue: paymentMethod === 'cash' ? Math.max(0, cashTendered - grandTotal) : 0,
        roomNumber: paymentMethod === 'room_charge' ? roomNumber : undefined,
      });
    } catch (err: any) {
      alert(`Error processing order: ${err.message}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 text-slate-100">
      {/* LEFT / CENTER PANEL: Catalog & Tables */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-slate-800">
        {/* Top Controls: Tabs & Search */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'menu'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Food Menu
            </button>
            <button
              onClick={() => setActiveTab('tables')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'tables'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>Floor Tables</span>
              {cart.tableNumber && (
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {cart.tableNumber}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'menu' && (
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search dishes by name or ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500"
              />
            </div>
          )}
        </div>

        {/* Content Area */}
        {activeTab === 'menu' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Category Tabs */}
            <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/30 overflow-x-auto flex items-center gap-2 no-scrollbar">
              <button
                onClick={() => setSelectedCategoryId('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategoryId === 'all'
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                All Items ({menuItems.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategoryId === cat.id
                      ? 'bg-slate-100 text-slate-900 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Menu Items Grid */}
            <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => {
                const hasModifiers = item.modifiers && item.modifiers.length > 0;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="group relative bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-orange-500/50 rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-md hover:shadow-xl select-none"
                  >
                    {/* Item Image & Badges */}
                    <div className="relative h-28 w-full rounded-xl overflow-hidden mb-2.5 bg-slate-800">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Utensils className="w-8 h-8" />
                        </div>
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1">
                        {item.isChefSpecial && (
                          <span className="p-1 rounded-md bg-amber-500/90 text-slate-950 font-bold text-[10px] flex items-center gap-0.5 shadow">
                            <Sparkles className="w-3 h-3" />
                          </span>
                        )}
                        {item.isSpicy && (
                          <span className="p-1 rounded-md bg-rose-600/90 text-white text-[10px] flex items-center shadow">
                            <Flame className="w-3 h-3" />
                          </span>
                        )}
                        {item.isVeg && (
                          <span className="p-1 rounded-md bg-emerald-600/90 text-white text-[10px] flex items-center shadow">
                            <Leaf className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      {hasModifiers && (
                        <div className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur text-[10px] px-1.5 py-0.5 rounded text-orange-300 font-medium">
                          Options
                        </div>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm text-slate-100 line-clamp-1 group-hover:text-orange-400 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description || 'Gourmet freshly made dish.'}
                      </p>
                    </div>

                    {/* Price & Add Trigger */}
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="font-bold text-base text-white">
                        ${item.price.toFixed(2)}
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-orange-500/20 group-hover:bg-orange-500 text-orange-400 group-hover:text-white flex items-center justify-center transition-colors">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Floor Tables Grid */
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-white">Select Dining Table or Room</h3>
                <p className="text-xs text-slate-400">Click a table to attach current POS order</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" /> Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500" /> Occupied
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-sky-500" /> Billed
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {tables.map((tbl) => {
                const isSelected = cart.tableId === tbl.id;
                const statusColor =
                  tbl.status === 'available'
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                    : tbl.status === 'occupied'
                    ? 'border-amber-500/40 bg-amber-950/20 text-amber-300'
                    : 'border-sky-500/40 bg-sky-950/20 text-sky-300';

                return (
                  <button
                    key={tbl.id}
                    onClick={() => handleSelectTable(tbl)}
                    className={`p-5 rounded-2xl border-2 flex flex-col items-center text-center space-y-2 transition-all hover:scale-105 ${statusColor} ${
                      isSelected ? 'ring-2 ring-orange-500 shadow-xl' : ''
                    }`}
                  >
                    <div className="text-2xl font-black">{tbl.tableNumber}</div>
                    <span className="text-xs opacity-80">{tbl.section}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-900/60 uppercase font-semibold">
                      {tbl.status} ({tbl.capacity} Seats)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT PANEL: Active Cart & Fast Checkout */}
      <div className="w-full lg:w-[420px] bg-slate-900 flex flex-col h-full overflow-hidden shadow-2xl">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-orange-400" />
              <span className="font-bold text-base text-white">Current Order</span>
              {cart.tableNumber && (
                <span className="px-2 py-0.5 rounded-md bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-bold">
                  {cart.tableNumber}
                </span>
              )}
            </div>

            {cart.items.length > 0 && (
              <button
                onClick={() => dispatch(clearCart())}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>

          {/* Dining Type / Guest Name inputs */}
          <div className="grid grid-cols-2 gap-2">
            <select
              value={cart.orderType}
              onChange={(e) => dispatch(setOrderType(e.target.value as any))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
            >
              <option value="dine_in">Dine In</option>
              <option value="takeaway">Takeaway</option>
              <option value="room_service">Room Service</option>
            </select>

            <input
              type="text"
              placeholder="Guest Name (Optional)"
              value={cart.customerName}
              onChange={(e) => dispatch(setCustomerInfo({ customerName: e.target.value }))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {cart.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-6 space-y-2">
              <Utensils className="w-12 h-12 stroke-1 text-slate-600" />
              <p className="text-sm font-medium text-slate-400">Cart is Empty</p>
              <p className="text-xs text-slate-500">Tap items on the left to add to order ticket.</p>
            </div>
          ) : (
            cart.items.map((ci) => (
              <div
                key={ci.id}
                className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h5 className="font-semibold text-sm text-slate-100">{ci.name}</h5>
                    <span className="text-xs text-slate-400 font-medium">
                      ${ci.unitPrice.toFixed(2)} each
                    </span>

                    {/* Modifiers badge list */}
                    {ci.selectedModifiers && ci.selectedModifiers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ci.selectedModifiers.map((m, mi) => (
                          <span
                            key={mi}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300"
                          >
                            {m.optionName} {m.price > 0 && `(+$${m.price.toFixed(2)})`}
                          </span>
                        ))}
                      </div>
                    )}

                    {ci.specialInstructions && (
                      <p className="text-[11px] text-amber-300/80 italic mt-0.5">
                        &ldquo;{ci.specialInstructions}&rdquo;
                      </p>
                    )}
                  </div>

                  <span className="font-bold text-sm text-white">${ci.totalPrice.toFixed(2)}</span>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-700/40">
                  <button
                    onClick={() => dispatch(removeFromCart(ci.id))}
                    className="text-slate-400 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center bg-slate-700/60 rounded-lg p-0.5">
                    <button
                      onClick={() => dispatch(updateQuantity({ id: ci.id, quantity: ci.quantity - 1 }))}
                      className="w-6 h-6 rounded bg-slate-600 hover:bg-slate-500 flex items-center justify-center text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold">{ci.quantity}</span>
                    <button
                      onClick={() => dispatch(updateQuantity({ id: ci.id, quantity: ci.quantity + 1 }))}
                      className="w-6 h-6 rounded bg-slate-600 hover:bg-slate-500 flex items-center justify-center text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Calculation & Checkout Area */}
        {cart.items.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/95 space-y-3">
            {/* Calculation summary */}
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({taxRate}%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Charge ({serviceChargeRate}%)</span>
                <span>${serviceCharge.toFixed(2)}</span>
              </div>

              {/* Discount Selector */}
              <div className="flex items-center justify-between pt-1">
                <span>Discount ({cart.discountPercent}%)</span>
                <div className="flex items-center gap-1">
                  {[0, 5, 10, 15].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => dispatch(setDiscount(d))}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        cart.discountPercent === d
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {d}%
                    </button>
                  ))}
                  {discountAmount > 0 && (
                    <span className="text-emerald-400 font-bold ml-1">-${discountAmount.toFixed(2)}</span>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-base font-bold text-white">
                <span>Total Due</span>
                <span className="text-orange-400 text-xl">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions: Split Bill & Fast Pay */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsSplitModalOpen(true)}
                className="py-3 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Split className="w-4 h-4 text-orange-400" />
                <span>Split Bill</span>
              </button>

              <button
                type="button"
                onClick={handleCheckoutClick}
                className="col-span-2 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-between transition-all"
              >
                <span>Checkout & Pay</span>
                <span>${grandTotal.toFixed(2)}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {/* 1. Item Modifier Modal */}
      <ItemModifierModal
        item={selectedItemForMod}
        isOpen={isModifierModalOpen}
        onClose={() => setIsModifierModalOpen(false)}
        onConfirm={handleModifierConfirm}
      />

      {/* 2. Split Bill Modal */}
      <SplitBillModal
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
        totalAmount={grandTotal}
        onSettleSplit={(shares) => {
          alert(`Bill split into ${shares.length} parts of $${shares[0].toFixed(2)} each!`);
        }}
      />

      {/* 3. Payment Processing Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5 text-white">
            <h3 className="font-bold text-lg text-slate-100">Select Settlement Method</h3>

            {/* Total Display */}
            <div className="bg-slate-800 p-4 rounded-xl text-center space-y-1">
              <span className="text-xs text-slate-400 uppercase">Amount Due</span>
              <div className="text-3xl font-extrabold text-orange-400">${grandTotal.toFixed(2)}</div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-orange-500 bg-orange-500/20 text-orange-200 font-bold'
                    : 'border-slate-700 bg-slate-800/80 text-slate-300'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-400" />
                <span className="text-xs">Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('credit_card')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'credit_card'
                    ? 'border-orange-500 bg-orange-500/20 text-orange-200 font-bold'
                    : 'border-slate-700 bg-slate-800/80 text-slate-300'
                }`}
              >
                <CreditCard className="w-5 h-5 text-blue-400" />
                <span className="text-xs">Credit/Debit</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('room_charge')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'room_charge'
                    ? 'border-orange-500 bg-orange-500/20 text-orange-200 font-bold'
                    : 'border-slate-700 bg-slate-800/80 text-slate-300'
                }`}
              >
                <Building className="w-5 h-5 text-purple-400" />
                <span className="text-xs">Room Bill</span>
              </button>
            </div>

            {/* Cash Tendered Input */}
            {paymentMethod === 'cash' && (
              <div className="space-y-2 bg-slate-800/50 p-3.5 rounded-xl border border-slate-700">
                <label className="text-xs text-slate-300 font-semibold">Cash Tendered ($)</label>
                <input
                  type="number"
                  step="0.5"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white font-bold"
                />
                <div className="flex justify-between text-xs pt-1">
                  <span className="text-slate-400">Change Due:</span>
                  <span className="font-bold text-emerald-400">
                    ${Math.max(0, cashTendered - grandTotal).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Room Charge Input */}
            {paymentMethod === 'room_charge' && (
              <div className="space-y-2 bg-slate-800/50 p-3.5 rounded-xl border border-slate-700">
                <label className="text-xs text-slate-300 font-semibold">Guest Room Number</label>
                <input
                  type="text"
                  placeholder="e.g. Room 204"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={processPaymentMutation.isPending}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white shadow-lg shadow-emerald-600/30 flex items-center gap-2"
              >
                {processPaymentMutation.isPending ? 'Processing...' : 'Confirm & Complete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Thermal Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        order={lastPaidOrder}
        hotel={hotel || null}
        tenderedAmount={paymentMethod === 'cash' ? cashTendered : grandTotal}
        changeDue={paymentMethod === 'cash' ? Math.max(0, cashTendered - grandTotal) : 0}
        paymentMethod={paymentMethod}
      />
    </div>
  );
}
