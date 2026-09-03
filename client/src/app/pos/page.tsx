'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Tabs,
  Input,
  Button,
  Tag,
  Badge,
  Card,
  Radio,
  Select,
  InputNumber,
  Slider,
  Modal,
  Space,
  Typography,
  Divider,
  message,
  notification,
  Segmented,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  DollarOutlined,
  BankOutlined,
  SplitCellsOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  FireOutlined,
  AppstoreOutlined,
  TableOutlined,
  UserOutlined,
  WifiOutlined,
  DisconnectOutlined,
} from '@ant-design/icons';
import { Utensils, Sparkles, Flame, Leaf } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
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
import { setOnlineStatus } from '../../store/slices/posSessionSlice';
import { api } from '../../lib/api';
import { STALE } from '../../lib/queryClient';
import { MenuItem, DiningTable, SelectedModifier, Order, StaffUser } from '../../types';
import ItemModifierModal from '../../components/ItemModifierModal';
import SplitBillModal from '../../components/SplitBillModal';
import ReceiptModal from '../../components/ReceiptModal';
import { MenuItemCard, DiningTableCard, StatusBadge, EmptyState } from '../../components/ui';

const { Text, Title } = Typography;

export default function POSTerminalPage() {
  // ── Typed Redux hooks ────────────────────────────────────────────────────────
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const cart = useAppSelector((state) => state.cart);
  const isOnline = useAppSelector((state) => state.posSession.isOnline);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'menu' | 'tables' | 'cart'>('menu');

  // Queries
  const { data: hotel } = useQuery({
    queryKey: ['hotel'],
    queryFn: ({ signal }) => api.getHotel(undefined, signal),
    staleTime: STALE.HOTEL,
  });

  const { data: staffList = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: ({ signal }) => api.getStaff(signal),
  });

  const activeStaff = staffList.length > 0
    ? staffList
    : [
        { id: 'W-101', name: 'Marco Rossi', hotelId: '', role: 'waiter', pinCode: '1001', isActive: true },
        { id: 'W-102', name: 'Sophia Chen', hotelId: '', role: 'waiter', pinCode: '1002', isActive: true },
      ];

  // Receiving Waiter state
  const [selectedWaiter, setSelectedWaiter] = useState<{ id: string; name: string }>({
    id: activeStaff[0].id,
    name: activeStaff[0].name,
  });

  useEffect(() => {
    if (activeStaff.length > 0 && (!selectedWaiter.id || !activeStaff.some(s => s.id === selectedWaiter.id))) {
      setSelectedWaiter({ id: activeStaff[0].id, name: activeStaff[0].name });
    }
  }, [activeStaff, selectedWaiter.id]);

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

  // ── useEffect: Online / Offline detection ────────────────────────────────────
  // Syncs browser connectivity state into Redux so any component can react to it.
  // The cleanup removes listeners when the component unmounts.
  useEffect(() => {
    const handleOnline = () => {
      dispatch(setOnlineStatus(true));
      message.success({ content: 'Back online — data syncing…', key: 'connectivity', duration: 2 });
    };
    const handleOffline = () => {
      dispatch(setOnlineStatus(false));
      message.warning({ content: 'You are offline', key: 'connectivity', duration: 0 });
    };

    // Set initial state correctly (user may have loaded page while offline)
    dispatch(setOnlineStatus(navigator.onLine));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      message.destroy('connectivity');
    };
  }, [dispatch]);

  // ── useEffect: Dynamic document title ────────────────────────────────────────
  // Updates the browser tab title to reflect cart item count.
  // Cleanup resets it to the default title on unmount.
  useEffect(() => {
    const totalQty = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    document.title = totalQty > 0
      ? `(${totalQty}) Order Ticket — POS Project`
      : 'POS Project Terminal';
    return () => {
      document.title = 'POS Project Terminal';
    };
  }, [cart.items]);

  // ── useEffect: Keyboard shortcuts ────────────────────────────────────────────
  // Escape closes any open modal without reaching for the mouse.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPaymentModalOpen(false);
        setIsModifierModalOpen(false);
        setIsSplitModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Queries (with signal for abort on unmount) ───────────────────────────────
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: ({ signal }) => api.getCategories(signal),
    staleTime: STALE.MENU,
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu-items'],
    queryFn: ({ signal }) => api.getMenuItems(undefined, signal),
    staleTime: STALE.MENU,
  });

  const { data: tables = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: ({ signal }) => api.getTables(signal),
    staleTime: STALE.TABLES,
    refetchInterval: STALE.TABLES, // auto-poll tables every 15 s
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
      message.success('Payment settled and receipt generated!');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  // Filtered menu items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategoryId === 'all' || item.categoryId === selectedCategoryId;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      message.success({ content: `Added ${item.name} to cart`, duration: 1 });
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
    message.success({ content: `Added ${payload.item.name} with modifiers`, duration: 1.5 });
  };

  const handleSelectTable = (tbl: DiningTable) => {
    dispatch(setTable({ tableId: tbl.id, tableNumber: tbl.tableNumber }));
    setActiveTab('menu');
    message.info(`Assigned to Table ${tbl.tableNumber}`);
  };

  const handleCheckoutClick = () => {
    if (cart.items.length === 0) return;
    setCashTendered(grandTotal);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    try {
      const orderPayload: Partial<Order> = {
        hotelId: hotel?.id,
        tableId: cart.tableId || undefined,
        tableNumber: cart.tableNumber || (cart.orderType === 'room_service' ? `Room ${roomNumber}` : 'Takeaway'),
        orderType: cart.orderType,
        source: 'pos',
        customerName: cart.customerName || 'Guest',
        customerNotes: cart.customerNotes,
        serverStaffId: selectedWaiter.id,
        serverStaffName: selectedWaiter.name,
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
      notification.error({
        message: 'Payment Error',
        description: err.message || 'Failed to settle order payment.',
      });
    }
  };

  const categoryTabItems = [
    { key: 'all', label: `All Items (${menuItems.length})` },
    ...categories.map((c) => ({
      key: c.id,
      label: c.name,
    })),
  ];
  const totalCartQty = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-slate-100 text-slate-900 relative">
      {/* LEFT / CENTER: Catalog & Tables */}
      <div className={`flex-1 flex-col h-full overflow-hidden border-r border-slate-200 bg-slate-50 ${
        activeTab === 'cart' ? 'hidden lg:flex' : 'flex'
      }`}>
        {/* Top Controls */}
        <div className="p-3 md:p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Segmented
              size="large"
              value={activeTab}
              onChange={(val) => setActiveTab(val as 'menu' | 'tables' | 'cart')}
              options={[
                { label: 'Food Menu', value: 'menu', icon: <AppstoreOutlined /> },
                {
                  label: (
                    <span className="flex items-center gap-1.5">
                      <span>Floor Tables</span>
                      {cart.tableNumber && (
                        <Tag color="orange" className="!m-0 !font-black !text-[11px] !rounded-md">
                          {cart.tableNumber}
                        </Tag>
                      )}
                    </span>
                  ),
                  value: 'tables',
                  icon: <TableOutlined />,
                },
                {
                  label: (
                    <span className="lg:hidden flex items-center gap-1.5">
                      <span>Cart</span>
                      {totalCartQty > 0 && (
                        <Badge count={totalCartQty} size="small" />
                      )}
                    </span>
                  ),
                  value: 'cart',
                  icon: <ShoppingCartOutlined className="lg:hidden" />,
                },
              ]}
              className="!bg-slate-100 !p-1 !rounded-2xl !border !border-slate-200 !font-bold text-slate-700"
            />
          </div>

          {activeTab === 'menu' && (
            <div className="flex-1 min-w-[200px] max-w-md">
              <Input
                placeholder="Search dishes..."
                prefix={<SearchOutlined className="text-slate-400 mr-1.5" />}
                allowClear
                size="large"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="!bg-slate-100 !border-slate-200 !rounded-2xl !text-slate-800 focus:!bg-white"
              />
            </div>
          )}

          {/* Connectivity indicator */}
          <Tooltip title={isOnline ? 'Connected to server' : 'Offline — showing cached data'}>
            <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border ${
              isOnline
                ? 'text-emerald-700 border-emerald-200 bg-emerald-50'
                : 'text-rose-700 border-rose-200 bg-rose-50'
            }`}>
              {isOnline ? <WifiOutlined /> : <DisconnectOutlined />}
              {isOnline ? 'Online' : 'Offline'}
            </div>
          </Tooltip>
        </div>

        {/* Content View */}
        {activeTab === 'menu' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Category Tabs */}
            <div className="px-4 bg-white border-b border-slate-200">
              <Tabs
                activeKey={selectedCategoryId}
                onChange={(k) => setSelectedCategoryId(k)}
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
                    const inCartCount = cart.items
                      .filter((i) => i.menuItemId === item.id)
                      .reduce((sum, i) => sum + i.quantity, 0);

                    return (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onSelect={handleItemClick}
                        inCartQuantity={inCartCount}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Floor Tables Grid */
          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-5">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="font-black text-base text-slate-900">Dining Tables & Rooms</h3>
                <p className="text-xs font-semibold text-slate-500">Select a table to assign to current ticket</p>
              </div>
              <Space>
                <StatusBadge status="available" size="small" />
                <StatusBadge status="occupied" size="small" />
                <StatusBadge status="reserved" size="small" />
              </Space>
            </div>

            {tables.length === 0 ? (
              <EmptyState
                title="No dining tables"
                description="Go to Admin & Tables to create tables."
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {tables.map((tbl) => (
                  <DiningTableCard
                    key={tbl.id}
                    table={tbl}
                    isSelected={cart.tableId === tbl.id}
                    onSelect={handleSelectTable}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT PANEL: Cart & Fast Checkout (White surface + High Contrast) */}
      <div className={`w-full lg:w-[420px] bg-white flex-col h-full overflow-hidden shadow-xl border-l border-slate-200 ${
        activeTab === 'cart' ? 'flex' : 'hidden lg:flex'
      }`}>
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                type="text"
                size="small"
                onClick={() => setActiveTab('menu')}
                className="lg:hidden !text-xs !font-bold !text-slate-600 !px-2 !rounded-lg !bg-slate-200"
              >
                &larr; Menu
              </Button>
              <ShoppingCartOutlined className="text-xl text-orange-600" />
              <span className="font-black text-base text-slate-900">Order Ticket</span>
              {cart.tableNumber && (
                <Tag color="orange" className="!font-black !text-xs !rounded-md">
                  {cart.tableNumber}
                </Tag>
              )}
            </div>

            {cart.items.length > 0 && (
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => dispatch(clearCart())}
                className="!text-xs font-bold"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Assigned Receiving Waiter */}
          <div className="flex items-center gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-7 h-7 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 flex-shrink-0">
              <UserOutlined className="text-xs" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Receiving Waiter</span>
              <Select
                size="small"
                variant="borderless"
                value={selectedWaiter.id}
                onChange={(val) => {
                  const found = activeStaff.find((w) => w.id === val);
                  if (found) setSelectedWaiter({ id: found.id, name: found.name });
                }}
                options={activeStaff.map((w) => ({
                  value: w.id,
                  label: `${w.name} (${w.id})`,
                }))}
                className="w-full !p-0 font-bold text-slate-900"
              />
            </div>
            <Tag color="orange" className="!m-0 !font-mono !font-bold text-[10px] !rounded-md">
              {selectedWaiter.id}
            </Tag>
          </div>

          {/* Dining Type & Guest Name */}
          <div className="grid grid-cols-2 gap-2">
            <Select
              size="middle"
              value={cart.orderType}
              onChange={(val) => dispatch(setOrderType(val))}
              options={[
                { label: 'Dine In', value: 'dine_in' },
                { label: 'Takeaway', value: 'takeaway' },
                { label: 'Room Service', value: 'room_service' },
              ]}
              className="w-full font-bold"
            />
            <Input
              size="middle"
              placeholder="Guest Name"
              prefix={<UserOutlined className="text-slate-400" />}
              value={cart.customerName}
              onChange={(e) => dispatch(setCustomerInfo({ customerName: e.target.value }))}
              className="!rounded-xl font-medium"
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
          {cart.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6 space-y-2">
              <ShoppingCartOutlined className="text-4xl text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No items added yet</p>
              <p className="text-xs text-slate-500">Tap items on the left to add to order ticket.</p>
            </div>
          ) : (
            cart.items.map((ci) => (
              <div
                key={ci.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-3 space-y-2 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h5 className="font-black text-sm text-slate-900">{ci.name}</h5>
                    <span className="text-xs text-slate-500 font-semibold">
                      ${ci.unitPrice.toFixed(2)} each
                    </span>

                    {/* Modifiers tags */}
                    {ci.selectedModifiers && ci.selectedModifiers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ci.selectedModifiers.map((m, mi) => (
                          <Tag key={mi} color="default" className="!text-[10px] !m-0 !rounded-md">
                            {m.optionName} {m.price > 0 && `(+$${m.price.toFixed(2)})`}
                          </Tag>
                        ))}
                      </div>
                    )}

                    {ci.specialInstructions && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md italic mt-1">
                        &ldquo;{ci.specialInstructions}&rdquo;
                      </p>
                    )}
                  </div>

                  <span className="font-black text-sm text-slate-900">${ci.totalPrice.toFixed(2)}</span>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => dispatch(removeFromCart(ci.id))}
                  />

                  <div className="flex items-center bg-slate-100 rounded-xl p-0.5">
                    <Button
                      size="small"
                      type="text"
                      icon={<MinusOutlined />}
                      onClick={() => dispatch(updateQuantity({ id: ci.id, quantity: ci.quantity - 1 }))}
                      className="!text-slate-700 font-bold"
                    />
                    <span className="w-7 text-center text-xs font-black text-slate-900">{ci.quantity}</span>
                    <Button
                      size="small"
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={() => dispatch(updateQuantity({ id: ci.id, quantity: ci.quantity + 1 }))}
                      className="!text-slate-700 font-bold"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculation & Fast Pay */}
        {cart.items.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-white space-y-3 shadow-lg">
            <div className="space-y-1.5 text-xs text-slate-600 font-semibold">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({taxRate}%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Charge ({serviceChargeRate}%)</span>
                <span>${serviceCharge.toFixed(2)}</span>
              </div>

              {/* Discount Slider / Options */}
              <div className="flex items-center justify-between pt-1">
                <span>Discount ({cart.discountPercent}%)</span>
                <Space size={4}>
                  {[0, 5, 10, 15].map((d) => (
                    <Button
                      key={d}
                      size="small"
                      type={cart.discountPercent === d ? 'primary' : 'default'}
                      onClick={() => dispatch(setDiscount(d))}
                      className="!text-[10px] !h-6 !px-2 !rounded-md !font-bold"
                    >
                      {d}%
                    </Button>
                  ))}
                  {discountAmount > 0 && (
                    <span className="text-emerald-600 font-bold ml-1">-${discountAmount.toFixed(2)}</span>
                  )}
                </Space>
              </div>

              <Divider className="!border-slate-200 !my-2" />

              <div className="flex items-center justify-between text-base font-bold text-slate-900">
                <span>Total Amount Due</span>
                <span className="text-orange-600 text-2xl font-black">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <Button
                icon={<SplitCellsOutlined />}
                onClick={() => setIsSplitModalOpen(true)}
                className="!h-12 !rounded-2xl !bg-slate-100 hover:!bg-slate-200 !border-slate-200 !text-slate-800 !text-xs !font-bold"
              >
                Split Bill
              </Button>

              <Button
                type="primary"
                size="large"
                icon={<CreditCardOutlined />}
                onClick={handleCheckoutClick}
                className="col-span-2 !h-12 !rounded-2xl !bg-gradient-to-r !from-orange-500 via-rose-500 to-amber-500 hover:!opacity-95 !font-black !text-sm !shadow-lg !shadow-orange-500/25 flex items-center justify-between border-0 text-white"
              >
                <span>Checkout & Pay</span>
                <span>${grandTotal.toFixed(2)}</span>
              </Button>
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
          message.success(`Bill split into ${shares.length} parts of $${shares[0].toFixed(2)} each!`);
        }}
      />

      {/* 3. Fast Payment Modal */}
      <Modal
        open={isPaymentModalOpen}
        onCancel={() => setIsPaymentModalOpen(false)}
        footer={null}
        width={460}
        centered
        styles={{ body: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24 } }}
        title={<span className="font-black text-base text-slate-900">Select Settlement Method</span>}
      >
        <div className="space-y-4 pt-2">
          {/* Total */}
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl text-center">
            <span className="text-xs text-orange-700 font-bold uppercase tracking-wider block mb-1">Total Due</span>
            <span className="text-3xl font-black text-orange-600">${grandTotal.toFixed(2)}</span>
          </div>

          {/* Payment Method */}
          <Segmented
            block
            size="large"
            value={paymentMethod}
            onChange={(val) => setPaymentMethod(val as any)}
            options={[
              { label: 'Cash', value: 'cash', icon: <DollarOutlined /> },
              { label: 'Credit/Debit', value: 'credit_card', icon: <CreditCardOutlined /> },
              { label: 'Room Bill', value: 'room_charge', icon: <BankOutlined /> },
            ]}
            className="!bg-slate-100 !p-1.5 !rounded-2xl !border !border-slate-200 font-bold"
          />

          {/* Cash Input */}
          {paymentMethod === 'cash' && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <label className="text-xs text-slate-700 font-bold block">Cash Tendered ($)</label>
              <InputNumber
                size="large"
                className="w-full !rounded-xl font-bold"
                min={grandTotal}
                step={1}
                value={cashTendered}
                onChange={(val) => setCashTendered(val || grandTotal)}
              />
              <div className="flex justify-between text-xs pt-1">
                <span className="text-slate-500 font-medium">Change Due:</span>
                <span className="font-black text-emerald-600 text-sm">
                  ${Math.max(0, cashTendered - grandTotal).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Room Charge Input */}
          {paymentMethod === 'room_charge' && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <label className="text-xs text-slate-700 font-bold block">Guest Room Number</label>
              <Input
                size="large"
                placeholder="e.g. Room 204"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="!rounded-xl font-bold"
              />
            </div>
          )}

          <Divider className="!border-slate-200 !my-3" />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <Button onClick={() => setIsPaymentModalOpen(false)} className="!h-10 !px-5 !rounded-xl !border-slate-200 !text-slate-700 font-bold">
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={handleConfirmPayment}
              loading={processPaymentMutation.isPending}
              className="!h-10 !px-6 !rounded-xl !bg-gradient-to-r !from-emerald-600 !to-teal-600 hover:!from-emerald-700 !font-bold !shadow-md !shadow-emerald-600/25 border-0 text-white"
            >
              Confirm & Settle
            </Button>
          </div>
        </div>
      </Modal>

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

      {/* Floating Bottom Cart Bar (Mobile Only) */}
      {activeTab !== 'cart' && cart.items.length > 0 && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
          <Button
            type="primary"
            block
            size="large"
            onClick={() => setActiveTab('cart')}
            className="!h-13 !rounded-2xl !bg-gradient-to-r !from-orange-500 !to-amber-500 hover:!from-orange-600 !font-black !text-sm !shadow-2xl flex items-center justify-between px-5 border-0 text-white"
          >
            <span className="flex items-center gap-2">
              <ShoppingCartOutlined className="text-lg" />
              <span>View Cart ({totalCartQty})</span>
            </span>
            <span className="bg-white/25 px-3 py-1 rounded-xl font-mono text-sm">
              ${grandTotal.toFixed(2)} &rarr;
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
