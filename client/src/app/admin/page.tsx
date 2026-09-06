'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs } from 'antd';
import {
  BarChartOutlined,
  QrcodeOutlined,
  UnorderedListOutlined,
  TeamOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { api } from '../../lib/api';
import AdminAnalyticsTab from '../../components/admin/AdminAnalyticsTab';
import AdminQRTab from '../../components/admin/AdminQRTab';
import AdminAddTableModal, { CreateTableFormValues } from '../../components/admin/AdminAddTableModal';
import AdminMenuTab from '../../components/admin/AdminMenuTab';
import AdminAddDishModal, { CreateDishFormValues } from '../../components/admin/AdminAddDishModal';
import AdminStaffTab from '../../components/admin/AdminStaffTab';
import AdminAddStaffModal, { CreateStaffFormValues } from '../../components/admin/AdminAddStaffModal';
import AdminSettingsTab from '../../components/admin/AdminSettingsTab';
import { useAdminMutations } from '../../hooks/useAdminMutations';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<string>('analytics');

  // Modals
  const [isNewTableOpen, setIsNewTableOpen] = useState(false);
  const [isNewDishOpen, setIsNewDishOpen] = useState(false);
  const [isNewStaffOpen, setIsNewStaffOpen] = useState(false);

  // Queries
  const { data: hotel } = useQuery({ queryKey: ['hotel'], queryFn: () => api.getHotel() });
  const { data: analytics } = useQuery({ queryKey: ['analytics'], queryFn: () => api.getAnalytics() });
  const { data: tables = [] } = useQuery({ queryKey: ['tables'], queryFn: () => api.getTables() });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => api.getCategories() });
  const { data: menuItems = [] } = useQuery({ queryKey: ['menu-items'], queryFn: () => api.getMenuItems() });
  const { data: staffList = [] } = useQuery({ queryKey: ['staff'], queryFn: () => api.getStaff() });

  // Mutations
  const {
    updateHotelMutation,
    createTableMutation,
    deleteTableMutation,
    createMenuItemMutation,
    deleteMenuItemMutation,
    toggleItemStockMutation,
    createStaffMutation,
    deleteStaffMutation,
  } = useAdminMutations();

  const handleCreateTable = (values: CreateTableFormValues) => {
    const token = `gh-${values.tableNumber.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`;
    createTableMutation.mutate({
      hotelId: hotel?.id || '',
      tableNumber: values.tableNumber,
      section: values.section,
      capacity: values.capacity,
      qrCodeToken: token,
      status: 'available',
    }, { onSuccess: () => setIsNewTableOpen(false) });
  };

  const handleCreateDish = (values: CreateDishFormValues) => {
    createMenuItemMutation.mutate({
      hotelId: hotel?.id || '',
      categoryId: values.categoryId || categories[0]?.id || '',
      name: values.name,
      description: values.description || '',
      price: values.price,
      costPrice: parseFloat((values.price * 0.35).toFixed(2)),
      imageUrl: values.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
      isAvailable: true,
      isVeg: !!values.isVeg,
      isSpicy: !!values.isSpicy,
      isChefSpecial: !!values.isChefSpecial,
      preparationTime: values.preparationTime || 15,
    }, { onSuccess: () => setIsNewDishOpen(false) });
  };

  const handleCreateStaff = (values: CreateStaffFormValues) => {
    createStaffMutation.mutate({
      hotelId: hotel?.id || '',
      name: values.name,
      email: values.email || '',
      role: values.role || 'waiter',
      pinCode: values.pinCode || '1234',
      isActive: true,
    }, { onSuccess: () => setIsNewStaffOpen(false) });
  };

  return (
    <div className="flex-1 bg-slate-50 text-slate-900 p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin & Operations Portal</h1>
          <p className="text-xs font-semibold text-slate-500">
            {hotel?.name || 'POS Project Bistro'} &bull; Restaurant Settings, QR Stands & Analytics
          </p>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'analytics', label: 'Sales Analytics', icon: <BarChartOutlined /> },
            { key: 'qr_generator', label: 'Table QR Stands', icon: <QrcodeOutlined /> },
            { key: 'menu_mgr', label: 'Menu Catalog', icon: <UnorderedListOutlined /> },
            { key: 'staff_mgr', label: 'Staff & Waiters', icon: <TeamOutlined /> },
            { key: 'hotel_settings', label: 'Settings', icon: <SettingOutlined /> },
          ]}
        />
      </div>

      {activeTab === 'analytics' && <AdminAnalyticsTab analytics={analytics} tables={tables} />}

      {activeTab === 'qr_generator' && (
        <>
          <AdminQRTab
            tables={tables}
            hotel={hotel}
            onOpenNewTable={() => setIsNewTableOpen(true)}
            onDeleteTable={(id) => deleteTableMutation.mutate(id)}
          />
          <AdminAddTableModal
            open={isNewTableOpen}
            onClose={() => setIsNewTableOpen(false)}
            onSubmit={handleCreateTable}
            loading={createTableMutation.isPending}
          />
        </>
      )}

      {activeTab === 'menu_mgr' && (
        <>
          <AdminMenuTab
            menuItems={menuItems}
            categories={categories}
            onOpenNewDish={() => setIsNewDishOpen(true)}
            onDeleteDish={(id) => deleteMenuItemMutation.mutate(id)}
            onToggleStock={(id, isAvailable) => toggleItemStockMutation.mutate({ id, isAvailable })}
          />
          <AdminAddDishModal
            open={isNewDishOpen}
            onClose={() => setIsNewDishOpen(false)}
            onSubmit={handleCreateDish}
            categories={categories}
            loading={createMenuItemMutation.isPending}
          />
        </>
      )}

      {activeTab === 'staff_mgr' && (
        <>
          <AdminStaffTab
            staffList={staffList}
            onOpenNewStaff={() => setIsNewStaffOpen(true)}
            onDeleteStaff={(id) => deleteStaffMutation.mutate(id)}
          />
          <AdminAddStaffModal
            open={isNewStaffOpen}
            onClose={() => setIsNewStaffOpen(false)}
            onSubmit={handleCreateStaff}
            loading={createStaffMutation.isPending}
          />
        </>
      )}

      {activeTab === 'hotel_settings' && (
        <AdminSettingsTab
          hotel={hotel}
          onSubmit={(values) => updateHotelMutation.mutate(values)}
          loading={updateHotelMutation.isPending}
        />
      )}
    </div>
  );
}
