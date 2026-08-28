'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { DiningTable, MenuItem, Category } from '../../types';
import QRStandCard from '../../components/QRStandCard';
import {
  BarChart3,
  QrCode,
  UtensilsCrossed,
  Plus,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  CheckCircle,
  XCircle,
  Printer,
  Sparkles,
} from 'lucide-react';

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'analytics' | 'qr_generator' | 'menu_mgr'>('analytics');

  // Form states
  const [isNewTableOpen, setIsNewTableOpen] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableSection, setNewTableSection] = useState('Main Dining');
  const [newTableCapacity, setNewTableCapacity] = useState(4);

  const [isNewDishOpen, setIsNewDishOpen] = useState(false);
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState(15);
  const [dishCategory, setDishCategory] = useState('');
  const [dishDescription, setDishDescription] = useState('');
  const [dishImage, setDishImage] = useState('');
  const [dishVeg, setDishVeg] = useState(false);
  const [dishSpicy, setDishSpicy] = useState(false);
  const [dishChefSpecial, setDishChefSpecial] = useState(false);

  // Queries
  const { data: hotel } = useQuery({
    queryKey: ['hotel'],
    queryFn: () => api.getHotel(),
  });

  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.getAnalytics(),
  });

  const { data: tables = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: () => api.getTables(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu-items'],
    queryFn: () => api.getMenuItems(),
  });

  // Mutations
  const createTableMutation = useMutation({
    mutationFn: (newTbl: any) => api.createTable(newTbl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      setIsNewTableOpen(false);
      setNewTableNumber('');
    },
  });

  const createMenuItemMutation = useMutation({
    mutationFn: (newItem: any) => api.createMenuItem(newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      setIsNewDishOpen(false);
      setDishName('');
      setDishDescription('');
    },
  });

  const toggleItemStockMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      api.updateMenuItem(id, { isAvailable }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
  });

  const handleCreateTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber) return;
    const token = `gh-${newTableNumber.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`;
    createTableMutation.mutate({
      hotelId: hotel?.id || '',
      tableNumber: newTableNumber,
      section: newTableSection,
      capacity: newTableCapacity,
      qrCodeToken: token,
      status: 'available',
    });
  };

  const handleCreateDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName) return;
    createMenuItemMutation.mutate({
      hotelId: hotel?.id || '',
      categoryId: dishCategory || categories[0]?.id || '',
      name: dishName,
      description: dishDescription,
      price: parseFloat(dishPrice.toString()),
      costPrice: parseFloat((dishPrice * 0.35).toFixed(2)),
      imageUrl: dishImage || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
      isAvailable: true,
      isVeg: dishVeg,
      isSpicy: dishSpicy,
      isChefSpecial: dishChefSpecial,
      preparationTime: 15,
    });
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin & Operations Portal</h1>
          <p className="text-xs text-slate-400">
            {hotel?.name || 'Grand Horizon Bistro'} &bull; Restaurant Settings, QR Stands & Analytics
          </p>
        </div>

        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-orange-500 text-white font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Sales Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('qr_generator')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'qr_generator'
                ? 'bg-orange-500 text-white font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Table QR Stands</span>
          </button>
          <button
            onClick={() => setActiveTab('menu_mgr')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'menu_mgr'
                ? 'bg-orange-500 text-white font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Menu & Pricing</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase">Today Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400">
                ${analytics?.todayRevenue ? analytics.todayRevenue.toFixed(2) : '1,548.50'}
              </div>
              <p className="text-[11px] text-emerald-400/80 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +14.2% vs yesterday
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase">Total Orders</span>
                <ShoppingBag className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {analytics?.totalOrdersToday || 34} Orders
              </div>
              <p className="text-[11px] text-slate-400">Dine-in & Room service</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase">Active Tables</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {tables.filter((t) => t.status === 'occupied').length} / {tables.length} Tables
              </div>
              <p className="text-[11px] text-blue-400/80">Real-time floor occupancy</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase">Average Ticket</span>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                ${analytics?.averageOrderValue ? analytics.averageOrderValue.toFixed(2) : '42.80'}
              </div>
              <p className="text-[11px] text-slate-400">Per guest checkout</p>
            </div>
          </div>

          {/* Popular Dishes & Hourly Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Selling Items */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-base text-white">Top Performing Dishes</h3>
              <div className="space-y-3">
                {analytics?.popularItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 font-bold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="font-medium text-sm text-slate-100">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-white">${item.revenue.toFixed(2)}</div>
                      <span className="text-xs text-slate-400">{item.quantity} sold</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hourly sales distribution */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-base text-white">Peak Hours Sales Volume</h3>
              <div className="space-y-2 pt-2">
                {analytics?.hourlySales.map((slot, idx) => {
                  const maxSales = 1400;
                  const percentage = Math.min(100, (slot.sales / maxSales) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span className="font-mono">{slot.hour}</span>
                        <span className="font-bold">${slot.sales}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QR STAND GENERATOR */}
      {activeTab === 'qr_generator' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div>
              <h3 className="font-bold text-base text-white">Table Stand QR Generator</h3>
              <p className="text-xs text-slate-400">
                Generate high-resolution printable table cards with embedded menu deep-links.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <Printer className="w-3.5 h-3.5" /> Print All Stands
              </button>
              <button
                onClick={() => setIsNewTableOpen(true)}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-orange-500/25"
              >
                <Plus className="w-3.5 h-3.5" /> Add Table / Room
              </button>
            </div>
          </div>

          {/* Grid of Printable QR Stands */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tables.map((tbl) => (
              <QRStandCard
                key={tbl.id}
                table={tbl}
                hotel={hotel || { name: 'Grand Horizon Bistro', slug: 'grand-horizon' } as any}
              />
            ))}
          </div>

          {/* New Table Modal */}
          {isNewTableOpen && (
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
              <form
                onSubmit={handleCreateTable}
                className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 text-white shadow-2xl"
              >
                <h3 className="font-bold text-lg">Add New Dining Table or Room</h3>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold">Table or Room Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. T-09 or Room 302"
                    value={newTableNumber}
                    onChange={(e) => setNewTableNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold">Dining Section</label>
                  <select
                    value={newTableSection}
                    onChange={(e) => setNewTableSection(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white"
                  >
                    <option value="Main Dining">Main Dining</option>
                    <option value="Patio Garden">Patio Garden</option>
                    <option value="Rooftop Lounge">Rooftop Lounge</option>
                    <option value="Room Service">Room Service</option>
                    <option value="Lounge & Bar">Lounge & Bar</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold">Seating Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newTableCapacity}
                    onChange={(e) => setNewTableCapacity(parseInt(e.target.value, 10) || 2)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewTableOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createTableMutation.isPending}
                    className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
                  >
                    {createTableMutation.isPending ? 'Saving...' : 'Create & Generate QR'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MENU & PRICING MANAGER */}
      {activeTab === 'menu_mgr' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div>
              <h3 className="font-bold text-base text-white">Menu Catalog & Dish Inventory</h3>
              <p className="text-xs text-slate-400">
                Update prices, toggle instant 86/out-of-stock status, and add gourmet creations.
              </p>
            </div>
            <button
              onClick={() => setIsNewDishOpen(true)}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-orange-500/25"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Dish
            </button>
          </div>

          {/* Dishes Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-700">
                  <tr>
                    <th className="p-4">Dish</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Tags</th>
                    <th className="p-4 text-center">In Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {menuItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-semibold text-slate-100 flex items-center gap-3">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-9 h-9 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <div>{item.name}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1 font-normal">
                            {item.description}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">
                        {categories.find((c) => c.id === item.categoryId)?.name || 'General'}
                      </td>
                      <td className="p-4 font-bold text-white">${item.price.toFixed(2)}</td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {item.isVeg && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                              Veg
                            </span>
                          )}
                          {item.isSpicy && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px]">
                              Spicy
                            </span>
                          )}
                          {item.isChefSpecial && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                              Special
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() =>
                            toggleItemStockMutation.mutate({
                              id: item.id,
                              isAvailable: !item.isAvailable,
                            })
                          }
                          className={`px-3 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 transition-all ${
                            item.isAvailable
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {item.isAvailable ? (
                            <>
                              <CheckCircle className="w-3 h-3" /> Available
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" /> 86 / Sold Out
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* New Dish Modal */}
          {isNewDishOpen && (
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
              <form
                onSubmit={handleCreateDish}
                className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 text-white shadow-2xl max-h-[90vh] overflow-y-auto"
              >
                <h3 className="font-bold text-lg">Add New Gourmet Item</h3>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold">Dish Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lobster Thermidor"
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-semibold">Category</label>
                    <select
                      value={dishCategory}
                      onChange={(e) => setDishCategory(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-semibold">Price ($)</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={dishPrice}
                      onChange={(e) => setDishPrice(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Rich description of the recipe and flavors..."
                    value={dishDescription}
                    onChange={(e) => setDishDescription(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold">Image URL (Unsplash or CDN)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={dishImage}
                    onChange={(e) => setDishImage(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white"
                  />
                </div>

                {/* Dietary checkboxes */}
                <div className="flex items-center gap-4 pt-1 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dishVeg}
                      onChange={(e) => setDishVeg(e.target.checked)}
                      className="rounded"
                    />
                    <span>Vegetarian</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dishSpicy}
                      onChange={(e) => setDishSpicy(e.target.checked)}
                      className="rounded"
                    />
                    <span>Spicy</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dishChefSpecial}
                      onChange={(e) => setDishChefSpecial(e.target.checked)}
                      className="rounded"
                    />
                    <span>Chef Special</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsNewDishOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMenuItemMutation.isPending}
                    className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
                  >
                    {createMenuItemMutation.isPending ? 'Saving...' : 'Add Dish to Menu'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
