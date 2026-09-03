'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Steps,
  Segmented,
  Drawer,
  Button,
  Tag,
  Badge,
  Card,
  Input,
  Space,
  Typography,
  Divider,
  message,
  Tooltip,
} from 'antd';
import {
  ShoppingCartOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  SearchOutlined,
  BellOutlined,
  EyeOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { Utensils, Sparkles, Flame, Clock, Heart, Coffee } from 'lucide-react';
import { api } from '../../../../lib/api';
import { MenuItem, SelectedModifier, Order } from '../../../../types';
import ItemModifierModal from '../../../../components/ItemModifierModal';
import FoodTablePreviewModal from '../../../../components/FoodTablePreviewModal';
import { StatusBadge, EmptyState } from '../../../../components/ui';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

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
  const hotelSlug = (params?.hotelId as string) || 'pos-project';
  const tableToken = (params?.tableId as string) || 'gh-tbl-01';

  const queryClient = useQueryClient();

  // Local state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'spicy' | 'special'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<LocalCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Modals state
  const [selectedItemForMod, setSelectedItemForMod] = useState<MenuItem | null>(null);
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
  const [previewTableItem, setPreviewTableItem] = useState<MenuItem | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Guest Info
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

  // Track live order status
  const { data: liveOrder } = useQuery({
    queryKey: ['order', activePlacedOrder?.id],
    queryFn: () => (activePlacedOrder?.id ? api.getOrder(activePlacedOrder.id) : null),
    enabled: !!activePlacedOrder?.id,
    refetchInterval: 5000,
  });

  const currentOrder = liveOrder || activePlacedOrder;

  // Order mutation
  const createOrderMutation = useMutation({
    mutationFn: (orderPayload: Partial<Order>) => api.createOrder(orderPayload),
    onSuccess: (newOrder) => {
      setActivePlacedOrder(newOrder);
      setCartItems([]);
      setIsCartOpen(false);
      message.success('Order sent to the kitchen!');
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
    message.success({ content: `Added ${item.name} to table cart`, duration: 1.5 });
  };

  const handleOpenTablePreview = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewTableItem(item);
    setIsPreviewModalOpen(true);
  };

  const handleCallWaiter = () => {
    message.success({
      content: `Waiter called for Table ${table?.tableNumber || 'T-01'}. A staff member is on the way!`,
      icon: <BellOutlined className="text-orange-500" />,
      duration: 3,
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
      serverStaffId: 'W-101',
      serverStaffName: 'Marco Rossi',
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

  const getStepStatus = () => {
    if (!currentOrder) return 0;
    if (currentOrder.status === 'pending') return 0;
    if (currentOrder.status === 'preparing') return 1;
    if (currentOrder.status === 'ready' || currentOrder.status === 'served' || currentOrder.status === 'completed') return 2;
    return 0;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col max-w-lg mx-auto pb-32 border-x border-slate-200/80 shadow-2xl relative">
      {/* ── 1. Top Customer Dining Header (White + RGB accents) ─────────────── */}
      <div className="bg-white/95 backdrop-blur sticky top-0 z-30 border-b border-slate-200/80 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-base text-slate-900 leading-tight">
                {hotel?.name || 'POS Project Dining'}
              </h1>
              <p className="text-[11px] font-semibold text-orange-600 flex items-center gap-1">
                <span>Digital Contactless Dining</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="small"
              icon={<BellOutlined />}
              onClick={handleCallWaiter}
              className="!rounded-xl !bg-orange-50 hover:!bg-orange-100 !border-orange-200 !text-orange-700 !font-bold !text-xs !h-8"
            >
              Call Waiter
            </Button>
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-sm">
              Table {table?.tableNumber || 'T-01'}
            </div>
          </div>
        </div>

        {/* Search Bar with RGB highlight */}
        <Input
          placeholder="Search dishes, drinks, steaks, pasta..."
          prefix={<SearchOutlined className="text-slate-400 mr-1.5" />}
          allowClear
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="!bg-slate-100/80 !border-slate-200 !rounded-2xl !py-2 !text-slate-800 focus:!border-orange-500 focus:!bg-white"
        />

        {/* Dietary Filters */}
        <Segmented
          block
          size="middle"
          value={dietaryFilter}
          onChange={(val) => setDietaryFilter(val as any)}
          options={[
            { label: 'All Dishes', value: 'all' },
            { label: 'Veg 🥗', value: 'veg' },
            { label: 'Spicy 🌶️', value: 'spicy' },
            { label: 'Chef Special ⭐', value: 'special' },
          ]}
          className="!bg-slate-100 !p-1 !rounded-2xl !font-semibold text-xs text-slate-700"
        />
      </div>

      {/* ── 2. Live Order Status Tracker (When active order exists) ───────────── */}
      {currentOrder && (
        <div className="m-4 bg-white p-4 rounded-3xl border border-orange-200 shadow-lg shadow-orange-500/5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="font-bold text-xs text-orange-600 flex items-center gap-1.5">
              <FireOutlined className="animate-bounce" /> Live Table Order Status
            </span>
            <Tag color="orange" className="!font-mono !font-black !rounded-lg !text-xs">
              {currentOrder.orderNumber}
            </Tag>
          </div>

          <Steps
            size="small"
            current={getStepStatus()}
            items={[
              { title: 'Sent', icon: <ClockCircleOutlined /> },
              { title: 'Cooking', icon: <FireOutlined /> },
              { title: 'Ready', icon: <CheckCircleOutlined /> },
            ]}
          />
          <p className="text-[11px] text-slate-500 text-center font-medium !m-0">
            Kitchen line is preparing your selections for Table {table?.tableNumber || 'T-01'}.
          </p>
        </div>
      )}

      {/* ── 3. Category Horizontal Filter Pills ──────────────────────────────── */}
      <div className="sticky top-[162px] z-20 bg-slate-50/95 backdrop-blur px-4 py-2.5 border-b border-slate-200/80 overflow-x-auto flex gap-2 no-scrollbar">
        <Button
          size="small"
          type={selectedCategory === 'all' ? 'primary' : 'default'}
          onClick={() => setSelectedCategory('all')}
          className={`!rounded-xl !text-xs !font-bold whitespace-nowrap !h-8 !px-3.5 transition-all ${
            selectedCategory === 'all'
              ? '!bg-slate-900 !text-white !shadow-sm'
              : '!bg-white !border-slate-200 !text-slate-700 hover:!border-slate-300'
          }`}
        >
          All Categories
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            size="small"
            type={selectedCategory === cat.id ? 'primary' : 'default'}
            onClick={() => setSelectedCategory(cat.id)}
            className={`!rounded-xl !text-xs !font-bold whitespace-nowrap !h-8 !px-3.5 transition-all ${
              selectedCategory === cat.id
                ? '!bg-slate-900 !text-white !shadow-sm'
                : '!bg-white !border-slate-200 !text-slate-700 hover:!border-slate-300'
            }`}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* ── 4. Menu Items Cards (White & RGB Glassmorphism) ──────────────────── */}
      <div className="p-4 space-y-3.5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleAddItem(item)}
            className="bg-white hover:bg-slate-50/80 p-3.5 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex gap-3.5 items-start relative group"
          >
            {/* Dish Info */}
            <div className="flex-1 flex flex-col justify-between self-stretch space-y-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.isChefSpecial && (
                    <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                      Chef Special
                    </span>
                  )}
                  {item.isVeg && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      Vegetarian
                    </span>
                  )}
                  {item.isSpicy && (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                      Spicy 🌶️
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 leading-snug group-hover:text-orange-600 transition-colors">
                  {item.name}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {item.description || 'Freshly made with artisanal ingredients.'}
                </p>
              </div>

              {/* Price & Action Row */}
              <div className="flex items-center justify-between pt-1">
                <span className="font-black text-base text-slate-900">
                  ${item.price.toFixed(2)}
                </span>

                <div className="flex items-center gap-2">
                  {/* Table Food Preview Button */}
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={(e) => handleOpenTablePreview(item, e)}
                    className="!rounded-xl !bg-slate-100 hover:!bg-slate-200 !border-slate-200 !text-slate-700 !font-bold !text-[11px] !h-7 !px-2.5"
                  >
                    Table View
                  </Button>

                  {/* Add Button */}
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddItem(item);
                    }}
                    className="!bg-gradient-to-r !from-orange-500 !to-amber-500 hover:!from-orange-600 !font-bold !rounded-xl !h-7 !px-3 !shadow-sm !shadow-orange-500/20"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Dish Image */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200 relative flex items-center justify-center">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : null}
              <Utensils className="w-6 h-6 text-slate-400 opacity-40 absolute" />
            </div>
          </div>
        ))}
      </div>

      {/* ── 5. Floating Bottom Cart Action Bar (Vibrant RGB Pill) ─────────────── */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40">
          <Button
            type="primary"
            size="large"
            block
            icon={<ShoppingCartOutlined className="text-lg" />}
            onClick={() => setIsCartOpen(true)}
            className="!h-14 !rounded-2xl !bg-gradient-to-r !from-orange-500 via-rose-500 to-amber-500 hover:!opacity-95 !font-black !text-base !shadow-2xl !shadow-orange-500/40 flex items-center justify-between px-5 border-0"
          >
            <div className="flex items-center gap-2.5">
              <span className="bg-white text-orange-600 font-black text-xs px-2.5 py-0.5 rounded-full shadow-sm">
                {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'}
              </span>
              <span className="text-white font-bold text-sm">View Table Cart</span>
            </div>
            <span className="text-white font-black text-base">${cartSubtotal.toFixed(2)} &rarr;</span>
          </Button>
        </div>
      )}

      {/* ── 6. Cart Checkout Drawer (Clean White & High Contrast) ────────────── */}
      <Drawer
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        placement="bottom"
        styles={{
          wrapper: { height: '82vh' },
          content: { backgroundColor: '#ffffff', borderTopLeftRadius: 28, borderTopRightRadius: 28 },
          body: { padding: '20px' },
        }}
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                <ShoppingCartOutlined className="text-base" />
              </div>
              <div>
                <span className="font-black text-base text-slate-900 block leading-tight">Table {table?.tableNumber || 'T-01'} Cart</span>
                <span className="text-xs text-slate-500">Contactless Kitchen Order</span>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400">{cartItems.length} items</span>
          </div>
        }
      >
        <div className="space-y-4 flex flex-col h-full justify-between">
          <div className="space-y-3 overflow-y-auto pr-1">
            {cartItems.map((ci, idx) => (
              <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{ci.item.name}</h4>
                    {ci.modifiers.length > 0 && (
                      <p className="text-xs text-orange-600 font-medium">
                        {ci.modifiers.map((m) => m.optionName).join(', ')}
                      </p>
                    )}
                    {ci.instructions && (
                      <p className="text-[11px] text-slate-500 italic">&ldquo;{ci.instructions}&rdquo;</p>
                    )}
                  </div>
                  <span className="font-extrabold text-sm text-slate-900">${ci.totalPrice.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-xs">
                  <span className="text-slate-600 font-semibold">Quantity: {ci.quantity}</span>
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => setCartItems((prev) => prev.filter((_, i) => i !== idx))}
                    className="font-semibold !text-xs"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            {/* Guest Name & Notes Form */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-700 block">Table & Special Instructions</span>
              <Input
                placeholder="Guest Name (e.g. John)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="!bg-slate-50 !border-slate-200 !rounded-xl !py-2 !text-slate-800 font-medium"
              />
              <TextArea
                rows={2}
                placeholder="Allergies or kitchen instructions (e.g. extra napkins, no cilantro)..."
                value={tableNotes}
                onChange={(e) => setTableNotes(e.target.value)}
                className="!bg-slate-50 !border-slate-200 !rounded-xl !py-2 !text-slate-800"
              />
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <div className="flex justify-between font-black text-lg text-slate-900">
              <span>Total Order Amount</span>
              <span className="text-orange-600">${cartSubtotal.toFixed(2)}</span>
            </div>
            <Button
              type="primary"
              size="large"
              block
              onClick={handlePlaceOrder}
              loading={createOrderMutation.isPending}
              className="!h-13 !rounded-2xl !bg-gradient-to-r !from-orange-500 via-rose-500 to-amber-500 hover:!opacity-95 !font-black !text-base !shadow-xl !shadow-orange-500/25 border-0"
            >
              Send Order to Kitchen &bull; ${cartSubtotal.toFixed(2)}
            </Button>
          </div>
        </div>
      </Drawer>

      {/* ── 7. Interactive Food Table Preview Modal ──────────────────────────── */}
      <FoodTablePreviewModal
        item={previewTableItem}
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        onOrder={(item) => handleAddItem(item)}
      />

      {/* ── 8. Item Modifier Modal ───────────────────────────────────────────── */}
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
