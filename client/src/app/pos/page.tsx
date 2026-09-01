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
import { MenuItem, DiningTable, SelectedModifier, Order } from '../../types';
import ItemModifierModal from '../../components/ItemModifierModal';
import SplitBillModal from '../../components/SplitBillModal';
import ReceiptModal from '../../components/ReceiptModal';

const { Text, Title } = Typography;

export default function POSTerminalPage() {
  // ── Typed Redux hooks ────────────────────────────────────────────────────────
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const cart = useAppSelector((state) => state.cart);
  const isOnline = useAppSelector((state) => state.posSession.isOnline);

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
      ? `(${totalQty}) Order Ticket — Grand Horizon POS`
      : 'Grand Horizon POS';
    return () => {
      document.title = 'Grand Horizon POS';
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
  const { data: hotel } = useQuery({
    queryKey: ['hotel'],
    queryFn: ({ signal }) => api.getHotel('grand-horizon', signal),
    staleTime: STALE.HOTEL,
  });

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

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 text-slate-100">
      {/* LEFT / CENTER: Catalog & Tables */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-slate-800">
        {/* Top Controls */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Segmented
              size="large"
              value={activeTab}
              onChange={(val) => setActiveTab(val as 'menu' | 'tables')}
              options={[
                { label: 'Food Menu', value: 'menu', icon: <AppstoreOutlined /> },
                {
                  label: (
                    <span className="flex items-center gap-1.5">
                      <span>Floor Tables</span>
                      {cart.tableNumber && (
                        <Tag color="orange" className="!m-0 !font-bold !text-[11px]">
                          {cart.tableNumber}
                        </Tag>
                      )}
                    </span>
                  ),
                  value: 'tables',
                  icon: <TableOutlined />,
                },
              ]}
              className="!bg-slate-800 !p-1 !rounded-xl !border !border-slate-700"
            />
          </div>

          {activeTab === 'menu' && (
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search dishes by name or ingredients..."
                prefix={<SearchOutlined className="text-slate-400 mr-1" />}
                allowClear
                size="large"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="!bg-slate-800/90 !border-slate-700 !rounded-xl !text-slate-100"
              />
            </div>
          )}

          {/* Connectivity indicator */}
          <Tooltip title={isOnline ? 'Connected to server' : 'Offline — showing cached data'}>
            <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${
              isOnline
                ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30'
                : 'text-rose-400 border-rose-500/30 bg-rose-950/30'
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
            <div className="px-4 bg-slate-900/40 border-b border-slate-800">
              <Tabs
                activeKey={selectedCategoryId}
                onChange={(k) => setSelectedCategoryId(k)}
                items={categoryTabItems}
                className="custom-antd-tabs"
              />
            </div>

            {/* Menu Items Grid */}
            <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => {
                const hasModifiers = item.modifiers && item.modifiers.length > 0;

                const cardContent = (
                  <Card
                    hoverable
                    onClick={() => handleItemClick(item)}
                    className="!bg-slate-900/90 hover:!bg-slate-800/90 !border-slate-800 hover:!border-orange-500/50 !rounded-2xl transition-all shadow-md hover:shadow-xl h-full flex flex-col justify-between select-none"
                    styles={{ body: { padding: '12px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' } }}
                  >
                    {/* Item Image */}
                    <div>
                      <div className="relative h-28 w-full rounded-xl overflow-hidden mb-2.5 bg-slate-800 flex items-center justify-center">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : null}
                        <div className="absolute inset-0 flex items-center justify-center text-slate-600 -z-0">
                          <Utensils className="w-8 h-8 opacity-40" />
                        </div>

                        {/* Top Tag Pills */}
                        <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1">
                          {item.isChefSpecial && <Tag color="gold" className="!m-0 !text-[10px] !font-bold">Special</Tag>}
                          {item.isSpicy && <Tag color="error" className="!m-0 !text-[10px]">Spicy</Tag>}
                          {item.isVeg && <Tag color="success" className="!m-0 !text-[10px]">Veg</Tag>}
                        </div>

                        {hasModifiers && (
                          <div className="absolute bottom-1.5 right-1.5 bg-black/75 backdrop-blur text-[10px] px-2 py-0.5 rounded-md text-orange-300 font-semibold">
                            Options
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-slate-100 line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {item.description || 'Gourmet freshly made dish.'}
                        </p>
                      </div>
                    </div>

                    {/* Price & Add */}
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="font-extrabold text-base text-white">
                        ${item.price.toFixed(2)}
                      </span>
                      <Button
                        type="primary"
                        shape="circle"
                        size="small"
                        icon={<PlusOutlined />}
                        className="!bg-orange-500 hover:!bg-orange-600 !shadow-md !shadow-orange-500/20"
                      />
                    </div>
                  </Card>
                );

                return (
                  <div key={item.id}>
                    {item.isChefSpecial ? (
                      <Badge.Ribbon text="Chef Pick" color="#f59e0b" className="!font-bold !text-[10px]">
                        {cardContent}
                      </Badge.Ribbon>
                    ) : (
                      cardContent
                    )}
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
                <h3 className="font-bold text-lg text-white">Dining Tables & Hotel Rooms</h3>
                <p className="text-xs text-slate-400">Click a table to link current cashier order</p>
              </div>
              <Space>
                <Tag color="success">Available</Tag>
                <Tag color="warning">Occupied</Tag>
                <Tag color="processing">Billed</Tag>
              </Space>
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
                  <div
                    key={tbl.id}
                    onClick={() => handleSelectTable(tbl)}
                    className={`p-5 rounded-2xl border-2 flex flex-col items-center text-center space-y-2 cursor-pointer transition-all hover:scale-105 shadow-lg ${statusColor} ${
                      isSelected ? 'ring-2 ring-orange-500 shadow-2xl scale-105' : ''
                    }`}
                  >
                    <div className="text-2xl font-black">{tbl.tableNumber}</div>
                    <span className="text-xs opacity-80">{tbl.section}</span>
                    <Tag color={tbl.status === 'available' ? 'success' : tbl.status === 'occupied' ? 'warning' : 'processing'}>
                      {tbl.capacity} Seats &bull; {tbl.status}
                    </Tag>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT PANEL: Cart & Fast Checkout */}
      <div className="w-full lg:w-[420px] bg-slate-900 flex flex-col h-full overflow-hidden shadow-2xl">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCartOutlined className="text-xl text-orange-400" />
              <span className="font-bold text-base text-white">Order Ticket</span>
              {cart.tableNumber && (
                <Tag color="orange" className="!font-bold !text-xs">
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
                className="!text-xs"
              >
                Clear
              </Button>
            )}
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
              className="w-full"
            />
            <Input
              size="middle"
              placeholder="Guest Name"
              prefix={<UserOutlined className="text-slate-500" />}
              value={cart.customerName}
              onChange={(e) => dispatch(setCustomerInfo({ customerName: e.target.value }))}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {cart.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-6 space-y-2">
              <ShoppingCartOutlined className="text-4xl text-slate-600" />
              <p className="text-sm font-semibold text-slate-400">No items added yet</p>
              <p className="text-xs text-slate-500">Tap items on the left to add to order ticket.</p>
            </div>
          ) : (
            cart.items.map((ci) => (
              <div
                key={ci.id}
                className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-3 space-y-2 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h5 className="font-bold text-sm text-slate-100">{ci.name}</h5>
                    <span className="text-xs text-slate-400 font-medium">
                      ${ci.unitPrice.toFixed(2)} each
                    </span>

                    {/* Modifiers tags */}
                    {ci.selectedModifiers && ci.selectedModifiers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ci.selectedModifiers.map((m, mi) => (
                          <Tag key={mi} color="default" className="!text-[10px] !m-0">
                            {m.optionName} {m.price > 0 && `(+$${m.price.toFixed(2)})`}
                          </Tag>
                        ))}
                      </div>
                    )}

                    {ci.specialInstructions && (
                      <p className="text-[11px] text-amber-300 italic mt-1">
                        &ldquo;{ci.specialInstructions}&rdquo;
                      </p>
                    )}
                  </div>

                  <span className="font-extrabold text-sm text-white">${ci.totalPrice.toFixed(2)}</span>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-700/50">
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => dispatch(removeFromCart(ci.id))}
                  />

                  <div className="flex items-center bg-slate-700/70 rounded-lg p-0.5">
                    <Button
                      size="small"
                      type="text"
                      icon={<MinusOutlined />}
                      onClick={() => dispatch(updateQuantity({ id: ci.id, quantity: ci.quantity - 1 }))}
                      className="!text-white"
                    />
                    <span className="w-7 text-center text-xs font-bold text-white">{ci.quantity}</span>
                    <Button
                      size="small"
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={() => dispatch(updateQuantity({ id: ci.id, quantity: ci.quantity + 1 }))}
                      className="!text-white"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculation & Fast Pay */}
        {cart.items.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/95 space-y-3">
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
                      className="!text-[10px] !h-6 !px-2"
                    >
                      {d}%
                    </Button>
                  ))}
                  {discountAmount > 0 && (
                    <span className="text-emerald-400 font-bold ml-1">-${discountAmount.toFixed(2)}</span>
                  )}
                </Space>
              </div>

              <Divider className="!border-slate-800 !my-2" />

              <div className="flex items-center justify-between text-base font-bold text-white">
                <span>Total Amount Due</span>
                <span className="text-orange-400 text-2xl font-black">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <Button
                icon={<SplitCellsOutlined />}
                onClick={() => setIsSplitModalOpen(true)}
                className="!h-12 !rounded-xl !bg-slate-800 !border-slate-700 !text-slate-200 !text-xs !font-semibold"
              >
                Split Bill
              </Button>

              <Button
                type="primary"
                size="large"
                icon={<CreditCardOutlined />}
                onClick={handleCheckoutClick}
                className="col-span-2 !h-12 !rounded-xl !bg-gradient-to-r !from-orange-500 !to-amber-600 !font-bold !text-sm !shadow-lg !shadow-orange-500/25 flex items-center justify-between"
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
        title={<span className="font-bold text-base text-slate-100">Select Settlement Method</span>}
      >
        <div className="space-y-4 pt-2">
          {/* Total */}
          <Card className="!bg-slate-900 !border-slate-800 text-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Total Due</span>
            <span className="text-3xl font-black text-orange-400">${grandTotal.toFixed(2)}</span>
          </Card>

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
            className="!bg-slate-900 !p-1.5 !rounded-xl !border !border-slate-800"
          />

          {/* Cash Input */}
          {paymentMethod === 'cash' && (
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
              <label className="text-xs text-slate-300 font-semibold block">Cash Tendered ($)</label>
              <InputNumber
                size="large"
                className="w-full"
                min={grandTotal}
                step={1}
                value={cashTendered}
                onChange={(val) => setCashTendered(val || grandTotal)}
              />
              <div className="flex justify-between text-xs pt-1">
                <span className="text-slate-400">Change Due:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  ${Math.max(0, cashTendered - grandTotal).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Room Charge Input */}
          {paymentMethod === 'room_charge' && (
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
              <label className="text-xs text-slate-300 font-semibold block">Guest Room Number</label>
              <Input
                size="large"
                placeholder="e.g. Room 204"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
              />
            </div>
          )}

          <Divider className="!border-slate-800 !my-3" />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <Button onClick={() => setIsPaymentModalOpen(false)} className="!h-10 !px-5 !rounded-xl !border-slate-700 !text-slate-300">
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={handleConfirmPayment}
              loading={processPaymentMutation.isPending}
              className="!h-10 !px-6 !rounded-xl !bg-emerald-600 hover:!bg-emerald-500 !font-bold !shadow-lg !shadow-emerald-600/30"
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
    </div>
  );
}
