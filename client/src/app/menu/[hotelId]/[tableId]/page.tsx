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
  FloatButton,
  message,
} from 'antd';
import {
  ShoppingCartOutlined,
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  SmileOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Utensils, Leaf, Sparkles, Flame } from 'lucide-react';
import { api } from '../../../../lib/api';
import { MenuItem, SelectedModifier, Order } from '../../../../types';
import ItemModifierModal from '../../../../components/ItemModifierModal';

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
    message.success({ content: `Added ${item.name}`, duration: 1 });
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

  // Step tracker index
  const getStepStatus = () => {
    if (!currentOrder) return 0;
    if (currentOrder.status === 'pending') return 0;
    if (currentOrder.status === 'preparing') return 1;
    if (currentOrder.status === 'ready' || currentOrder.status === 'served' || currentOrder.status === 'completed') return 2;
    return 0;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col max-w-md mx-auto pb-28 border-x border-slate-900 shadow-2xl relative">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-5 space-y-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white leading-tight">
                {hotel?.name || 'Grand Horizon Bistro'}
              </h1>
              <span className="text-xs text-orange-400 font-semibold">Contactless Dine-in Menu</span>
            </div>
          </div>

          <Tag color="orange" className="!font-bold !text-xs !px-3 !py-1 !rounded-full">
            Table {table?.tableNumber || 'T-01'}
          </Tag>
        </div>

        {/* Search */}
        <Input
          placeholder="Search menu items..."
          prefix={<SearchOutlined className="text-slate-400 mr-1" />}
          allowClear
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="!bg-slate-800/90 !border-slate-700 !rounded-2xl"
        />

        {/* Dietary Filters */}
        <Segmented
          block
          size="middle"
          value={dietaryFilter}
          onChange={(val) => setDietaryFilter(val as any)}
          options={[
            { label: 'All', value: 'all' },
            { label: 'Veg 🥗', value: 'veg' },
            { label: 'Spicy 🌶️', value: 'spicy' },
            { label: 'Chef 🌟', value: 'special' },
          ]}
          className="!bg-slate-800 !p-1 !rounded-xl"
        />
      </div>

      {/* Live Order Tracker (Ant Design Steps) */}
      {currentOrder && (
        <Card className="!m-4 !bg-slate-900/90 !border-orange-500/40 !rounded-2xl shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-xs text-orange-400 flex items-center gap-1.5">
                <FireOutlined /> Live Kitchen Tracker
              </span>
              <Tag color="orange" className="!font-mono !font-bold">
                {currentOrder.orderNumber}
              </Tag>
            </div>

            <Steps
              size="small"
              current={getStepStatus()}
              items={[
                { title: 'Received', icon: <ClockCircleOutlined /> },
                { title: 'Cooking', icon: <FireOutlined /> },
                { title: 'Ready', icon: <CheckCircleOutlined /> },
              ]}
              className="custom-antd-steps"
            />
            <p className="text-[11px] text-slate-400 text-center !m-0">
              Kitchen is freshly preparing your culinary selections.
            </p>
          </div>
        </Card>
      )}

      {/* Category Pills */}
      <div className="sticky top-16 z-20 bg-slate-950/95 backdrop-blur px-4 py-2.5 border-b border-slate-800 overflow-x-auto flex gap-2 no-scrollbar">
        <Button
          size="small"
          type={selectedCategory === 'all' ? 'primary' : 'default'}
          onClick={() => setSelectedCategory('all')}
          className="!rounded-lg !text-xs !font-semibold whitespace-nowrap"
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            size="small"
            type={selectedCategory === cat.id ? 'primary' : 'default'}
            onClick={() => setSelectedCategory(cat.id)}
            className="!rounded-lg !text-xs !font-semibold whitespace-nowrap"
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Menu Items List */}
      <div className="p-4 space-y-4">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            hoverable
            className="!bg-slate-900 !border-slate-800 hover:!border-slate-700 !rounded-2xl shadow-lg"
            bodyStyle={{ padding: '16px' }}
          >
            <div className="flex gap-3">
              <div className="flex-1 flex flex-col justify-between space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.isVeg && <Tag color="success" className="!text-[10px] !m-0">Veg</Tag>}
                    {item.isSpicy && <Tag color="error" className="!text-[10px] !m-0">Spicy</Tag>}
                    {item.isChefSpecial && <Tag color="gold" className="!text-[10px] !m-0">Special</Tag>}
                    <h3 className="font-bold text-sm text-slate-100">{item.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-extrabold text-base text-white">
                    ${item.price.toFixed(2)}
                  </span>
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => handleAddItem(item)}
                    className="!bg-gradient-to-r !from-orange-500 !to-amber-500 !font-bold !rounded-xl !shadow-md !shadow-orange-500/20"
                  >
                    Add
                  </Button>
                </div>
              </div>

              {item.imageUrl && (
                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Floating Bottom Cart Action */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-5 left-4 right-4 max-w-md mx-auto z-40">
          <Button
            type="primary"
            size="large"
            block
            icon={<ShoppingCartOutlined />}
            onClick={() => setIsCartOpen(true)}
            className="!h-14 !rounded-2xl !bg-gradient-to-r !from-orange-500 !to-amber-600 hover:!from-orange-600 !font-bold !text-base !shadow-2xl !shadow-orange-500/40 flex items-center justify-between px-5"
          >
            <div className="flex items-center gap-2">
              <Badge count={totalCartCount} overflowCount={99} style={{ backgroundColor: '#ffffff', color: '#ea580c', fontWeight: 'bold' }} />
              <span>View Table Order</span>
            </div>
            <span>${cartSubtotal.toFixed(2)} &rarr;</span>
          </Button>
        </div>
      )}

      {/* Ant Design Drawer for Cart Checkout */}
      <Drawer
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        placement="bottom"
        height="80vh"
        className="ant-drawer-luxury"
        title={
          <div className="flex items-center gap-2">
            <ShoppingCartOutlined className="text-orange-400" />
            <span className="font-bold text-base text-white">Your Table Cart</span>
          </div>
        }
      >
        <div className="space-y-4 flex flex-col h-full justify-between">
          <div className="space-y-3 overflow-y-auto pr-1">
            {cartItems.map((ci, idx) => (
              <div key={idx} className="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-slate-100">{ci.item.name}</h4>
                    {ci.modifiers.length > 0 && (
                      <p className="text-xs text-orange-300">
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
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => setCartItems((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            {/* Guest Name & Notes Form */}
            <div className="space-y-2 pt-2">
              <Input
                placeholder="Guest Name (Optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="!bg-slate-800 !border-slate-700 !rounded-xl"
              />
              <TextArea
                rows={2}
                placeholder="Special instructions for kitchen..."
                value={tableNotes}
                onChange={(e) => setTableNotes(e.target.value)}
                className="!bg-slate-800 !border-slate-700 !rounded-xl"
              />
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="flex justify-between font-bold text-lg">
              <span>Total Amount</span>
              <span className="text-orange-400">${cartSubtotal.toFixed(2)}</span>
            </div>
            <Button
              type="primary"
              size="large"
              block
              onClick={handlePlaceOrder}
              loading={createOrderMutation.isPending}
              className="!h-12 !rounded-xl !bg-gradient-to-r !from-orange-500 !to-amber-600 !font-bold !shadow-lg !shadow-orange-500/25"
            >
              Send Order to Kitchen
            </Button>
          </div>
        </div>
      </Drawer>

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
