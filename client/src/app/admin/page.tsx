'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Tabs,
  Table,
  Button,
  Tag,
  Card,
  Row,
  Col,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Checkbox,
  Switch,
  Space,
  Typography,
  Divider,
  Popconfirm,
  message,
} from 'antd';
import {
  BarChartOutlined,
  QrcodeOutlined,
  UnorderedListOutlined,
  PlusOutlined,
  PrinterOutlined,
  RiseOutlined,
  DeleteOutlined,
  SaveOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { api } from '../../lib/api';
import { DiningTable, MenuItem, Category, StaffUser, Hotel } from '../../types';
import QRStandCard from '../../components/QRStandCard';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('analytics');

  // Modal forms
  const [isNewTableOpen, setIsNewTableOpen] = useState(false);
  const [isNewDishOpen, setIsNewDishOpen] = useState(false);
  const [isNewStaffOpen, setIsNewStaffOpen] = useState(false);

  const [tableForm] = Form.useForm();
  const [dishForm] = Form.useForm();
  const [staffForm] = Form.useForm();
  const [hotelForm] = Form.useForm();

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

  const { data: staffList = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: () => api.getStaff(),
  });

  // Populate hotel form
  useEffect(() => {
    if (hotel) {
      hotelForm.setFieldsValue({
        name: hotel.name,
        tagline: hotel.tagline,
        currency: hotel.currency,
        currencySymbol: hotel.currencySymbol,
        taxRate: hotel.taxRate,
        serviceChargeRate: hotel.serviceChargeRate,
        address: hotel.address,
        phone: hotel.phone,
        email: hotel.email,
        logoUrl: hotel.logoUrl,
      });
    }
  }, [hotel, hotelForm]);

  // Mutations
  const updateHotelMutation = useMutation({
    mutationFn: (values: Partial<Hotel>) => api.updateHotel(values),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['hotel'] });
      message.success(`Restaurant settings updated for ${updated.name}!`);
    },
  });

  const createTableMutation = useMutation({
    mutationFn: (newTbl: any) => api.createTable(newTbl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      setIsNewTableOpen(false);
      tableForm.resetFields();
      message.success('New table created with dynamic QR code!');
    },
  });

  const deleteTableMutation = useMutation({
    mutationFn: (id: string) => api.deleteTable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      message.success('Table deleted successfully!');
    },
  });

  const createMenuItemMutation = useMutation({
    mutationFn: (newItem: any) => api.createMenuItem(newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      setIsNewDishOpen(false);
      dishForm.resetFields();
      message.success('New dish added to menu catalog!');
    },
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: (id: string) => api.deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      message.success('Dish removed from menu catalog!');
    },
  });

  const toggleItemStockMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      api.updateMenuItem(id, { isAvailable }),
    onSuccess: (_, variables) => {
      message.info(
        variables.isAvailable ? 'Dish marked back in stock.' : 'Dish marked 86 / Sold Out.'
      );
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
  });

  const createStaffMutation = useMutation({
    mutationFn: (staff: any) => api.createStaff(staff),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setIsNewStaffOpen(false);
      staffForm.resetFields();
      message.success('New staff member added!');
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: (id: string) => api.deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      message.success('Staff member removed!');
    },
  });

  const handleCreateTable = (values: any) => {
    const token = `gh-${values.tableNumber.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`;
    createTableMutation.mutate({
      hotelId: hotel?.id || '',
      tableNumber: values.tableNumber,
      section: values.section,
      capacity: values.capacity,
      qrCodeToken: token,
      status: 'available',
    });
  };

  const handleCreateDish = (values: any) => {
    createMenuItemMutation.mutate({
      hotelId: hotel?.id || '',
      categoryId: values.categoryId || categories[0]?.id || '',
      name: values.name,
      description: values.description || '',
      price: parseFloat(values.price),
      costPrice: parseFloat((values.price * 0.35).toFixed(2)),
      imageUrl: values.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
      isAvailable: true,
      isVeg: !!values.isVeg,
      isSpicy: !!values.isSpicy,
      isChefSpecial: !!values.isChefSpecial,
      preparationTime: values.preparationTime || 15,
    });
  };

  const handleCreateStaff = (values: any) => {
    createStaffMutation.mutate({
      hotelId: hotel?.id || '',
      name: values.name,
      email: values.email || '',
      role: values.role || 'waiter',
      pinCode: values.pinCode || '1234',
      isActive: true,
    });
  };

  // Ant Design Table Columns for Dishes
  const dishColumns = [
    {
      title: 'Dish',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: MenuItem) => (
        <div className="flex items-center gap-3">
          {record.imageUrl && (
            <img
              src={record.imageUrl}
              alt={text}
              className="w-10 h-10 rounded-xl object-cover shadow-sm bg-slate-100"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div>
            <div className="font-bold text-slate-900">{text}</div>
            <div className="text-xs text-slate-500 line-clamp-1">{record.description}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (catId: string) => {
        const cat = categories.find((c) => c.id === catId);
        return <Tag color="orange" className="!font-bold !rounded-md">{cat?.name || 'General'}</Tag>;
      },
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      sorter: (a: MenuItem, b: MenuItem) => a.price - b.price,
      render: (price: number) => <span className="font-black text-slate-900">${price.toFixed(2)}</span>,
    },
    {
      title: 'Tags',
      key: 'tags',
      render: (_: any, record: MenuItem) => (
        <Space size={4}>
          {record.isVeg && <Tag color="success" className="!rounded-md font-bold">Veg</Tag>}
          {record.isSpicy && <Tag color="error" className="!rounded-md font-bold">Spicy</Tag>}
          {record.isChefSpecial && <Tag color="gold" className="!rounded-md font-bold">Special</Tag>}
        </Space>
      ),
    },
    {
      title: 'Stock Status',
      key: 'status',
      align: 'center' as const,
      render: (_: any, record: MenuItem) => (
        <Switch
          checkedChildren="In Stock"
          unCheckedChildren="86 Sold Out"
          checked={record.isAvailable}
          onChange={(checked) =>
            toggleItemStockMutation.mutate({ id: record.id, isAvailable: checked })
          }
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right' as const,
      render: (_: any, record: MenuItem) => (
        <Popconfirm
          title="Delete dish?"
          description={`Are you sure you want to remove "${record.name}"?`}
          onConfirm={() => deleteMenuItemMutation.mutate(record.id)}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  // Table Columns for Staff
  const staffColumns = [
    {
      title: 'Staff ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <Tag color="orange" className="!font-mono !font-bold !rounded-md">{id}</Tag>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span className="font-bold text-slate-900">{name}</span>,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color="blue" className="!font-bold capitalize !rounded-md">
          {role}
        </Tag>
      ),
    },
    {
      title: 'Login PIN',
      dataIndex: 'pinCode',
      key: 'pinCode',
      render: (pin: string) => <span className="font-mono text-slate-600 font-bold">••••</span>,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'default'} className="!rounded-md font-bold">
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right' as const,
      render: (_: any, record: StaffUser) => (
        <Popconfirm
          title="Delete staff member?"
          description={`Remove ${record.name} from staff list?`}
          onConfirm={() => deleteStaffMutation.mutate(record.id)}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="flex-1 bg-slate-50 text-slate-900 p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin & Operations Portal</h1>
          <p className="text-xs font-semibold text-slate-500">
            {hotel?.name || 'POS Project Bistro'} &bull; Restaurant Settings, QR Stands & Analytics
          </p>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k)}
          items={[
            { key: 'analytics', label: 'Sales Analytics', icon: <BarChartOutlined /> },
            { key: 'qr_generator', label: 'Table QR Stands', icon: <QrcodeOutlined /> },
            { key: 'menu_mgr', label: 'Menu Catalog', icon: <UnorderedListOutlined /> },
            { key: 'staff_mgr', label: 'Staff & Waiters', icon: <TeamOutlined /> },
            { key: 'hotel_settings', label: 'Settings', icon: <SettingOutlined /> },
          ]}
        />
      </div>

      {/* TAB 1: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-3xl shadow-sm space-y-1">
                <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider block">Today Revenue</span>
                <div className="text-3xl font-black text-emerald-700">
                  ${analytics?.todayRevenue ? analytics.todayRevenue.toFixed(2) : '1,548.50'}
                </div>
                <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 pt-1">
                  <RiseOutlined /> +14.2% vs yesterday
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div className="bg-orange-50 border border-orange-200 p-5 rounded-3xl shadow-sm space-y-1">
                <span className="text-xs text-orange-800 font-bold uppercase tracking-wider block">Total Orders</span>
                <div className="text-3xl font-black text-orange-600">
                  {analytics?.totalOrdersToday || 34} Orders
                </div>
                <div className="text-[11px] text-orange-700 font-semibold pt-1">Dine-in & Room Service</div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div className="bg-blue-50 border border-blue-200 p-5 rounded-3xl shadow-sm space-y-1">
                <span className="text-xs text-blue-800 font-bold uppercase tracking-wider block">Occupied Tables</span>
                <div className="text-3xl font-black text-blue-700">
                  {tables.filter((t) => t.status === 'occupied').length} / {tables.length}
                </div>
                <div className="text-[11px] text-blue-700 font-semibold pt-1">Real-time floor state</div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div className="bg-purple-50 border border-purple-200 p-5 rounded-3xl shadow-sm space-y-1">
                <span className="text-xs text-purple-800 font-bold uppercase tracking-wider block">Avg. Order Value</span>
                <div className="text-3xl font-black text-purple-700">
                  ${analytics?.averageOrderValue ? analytics.averageOrderValue.toFixed(2) : '42.80'}
                </div>
                <div className="text-[11px] text-purple-700 font-semibold pt-1">Per guest checkout</div>
              </div>
            </Col>
          </Row>

          {/* Popular Dishes & Hourly Volume */}
          <Row gutter={[20, 20]}>
            <Col xs={24} lg={12}>
              <Card
                className="!bg-white !border-slate-200/90 !rounded-3xl shadow-sm overflow-hidden"
                title={<span className="font-black text-base text-slate-900">Top Performing Dishes</span>}
              >
                <div className="space-y-3">
                  {analytics?.popularItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80"
                    >
                      <div className="flex items-center gap-3">
                        <Tag color="orange" className="!font-black !text-xs !rounded-md">
                          #{idx + 1}
                        </Tag>
                        <span className="font-bold text-sm text-slate-900">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-sm text-slate-900">${item.revenue.toFixed(2)}</div>
                        <span className="text-xs text-slate-500 font-semibold">{item.quantity} orders</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                className="!bg-white !border-slate-200/90 !rounded-3xl shadow-sm overflow-hidden"
                title={<span className="font-black text-base text-slate-900">Peak Hours Sales Volume</span>}
              >
                <div className="space-y-3 pt-1">
                  {analytics?.hourlySales.map((slot, idx) => {
                    const maxSales = 1400;
                    const percentage = Math.min(100, (slot.sales / maxSales) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-600">
                          <span className="font-mono">{slot.hour}</span>
                          <span className="font-bold text-orange-600">${slot.sales}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* TAB 2: QR STAND GENERATOR */}
      {activeTab === 'qr_generator' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 p-5 rounded-3xl shadow-sm">
            <div>
              <h3 className="font-black text-base text-slate-900">Table Stand QR Generator</h3>
              <p className="text-xs text-slate-500 font-medium">
                Generate high-resolution printable table cards with embedded menu deep-links.
              </p>
            </div>
            <Space>
              <Button
                icon={<PrinterOutlined />}
                onClick={() => window.print()}
                className="!h-10 !rounded-xl !border-slate-200 !bg-slate-100 !text-slate-800 font-bold"
              >
                Print All Stands
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsNewTableOpen(true)}
                className="!h-10 !rounded-xl !bg-gradient-to-r !from-orange-500 !to-amber-500 hover:!from-orange-600 !font-bold !shadow-md border-0 text-white"
              >
                Add Table / Room
              </Button>
            </Space>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tables.map((tbl) => (
              <QRStandCard
                key={tbl.id}
                table={tbl}
                hotel={hotel || ({ name: 'POS Project Bistro', slug: 'pos-project' } as any)}
                onDelete={(id) => deleteTableMutation.mutate(id)}
              />
            ))}
          </div>

          {/* New Table Modal */}
          <Modal
            open={isNewTableOpen}
            onCancel={() => setIsNewTableOpen(false)}
            footer={null}
            centered
            styles={{ body: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24 } }}
            title={<span className="font-black text-base text-slate-900">Add New Dining Table or Room</span>}
          >
            <Form form={tableForm} layout="vertical" onFinish={handleCreateTable} className="pt-2">
              <Form.Item
                name="tableNumber"
                label="Table or Room Number"
                rules={[{ required: true, message: 'Please input table number' }]}
              >
                <Input placeholder="e.g. T-09 or Room 302" size="large" className="!rounded-xl font-bold" />
              </Form.Item>

              <Form.Item
                name="section"
                label="Dining Section"
                initialValue="Main Dining"
                rules={[{ required: true }]}
              >
                <Select
                  size="large"
                  className="font-bold"
                  options={[
                    { label: 'Main Dining', value: 'Main Dining' },
                    { label: 'Patio Garden', value: 'Patio Garden' },
                    { label: 'Rooftop Lounge', value: 'Rooftop Lounge' },
                    { label: 'Room Service', value: 'Room Service' },
                    { label: 'Lounge & Bar', value: 'Lounge & Bar' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="capacity"
                label="Seating Capacity"
                initialValue={4}
                rules={[{ required: true }]}
              >
                <InputNumber min={1} max={20} size="large" className="w-full !rounded-xl font-bold" />
              </Form.Item>

              <Divider className="!border-slate-200 !my-3" />

              <div className="flex items-center justify-end gap-3 pt-1">
                <Button onClick={() => setIsNewTableOpen(false)} className="!h-10 !px-5 !rounded-xl !border-slate-200 !text-slate-700 font-bold">
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={createTableMutation.isPending}
                  className="!h-10 !px-6 !rounded-xl !bg-gradient-to-r !from-orange-500 !to-amber-500 hover:!from-orange-600 !font-bold border-0 text-white"
                >
                  Create & Generate QR
                </Button>
              </div>
            </Form>
          </Modal>
        </div>
      )}

      {/* TAB 3: MENU & PRICING MANAGER */}
      {activeTab === 'menu_mgr' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 p-5 rounded-3xl shadow-sm">
            <div>
              <h3 className="font-black text-base text-slate-900">Menu Catalog & Dish Inventory</h3>
              <p className="text-xs text-slate-500 font-medium">
                Update prices, toggle instant 86 / out-of-stock status, and add gourmet creations.
              </p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsNewDishOpen(true)}
              className="!h-10 !rounded-xl !bg-gradient-to-r !from-orange-500 !to-amber-500 hover:!from-orange-600 !font-bold !shadow-md border-0 text-white"
            >
              Add New Dish
            </Button>
          </div>

          {/* Ant Design Table */}
          <Card className="!bg-white !border-slate-200/90 !rounded-3xl shadow-sm overflow-hidden" styles={{ body: { padding: 0 } }}>
            <Table
              dataSource={menuItems}
              columns={dishColumns}
              rowKey="id"
              pagination={{ pageSize: 8 }}
            />
          </Card>

          {/* New Dish Modal */}
          <Modal
            open={isNewDishOpen}
            onCancel={() => setIsNewDishOpen(false)}
            footer={null}
            width={520}
            centered
            styles={{ body: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24 } }}
            title={<span className="font-black text-base text-slate-900">Add New Gourmet Item</span>}
          >
            <Form form={dishForm} layout="vertical" onFinish={handleCreateDish} className="pt-2">
              <Form.Item
                name="name"
                label="Dish Name"
                rules={[{ required: true, message: 'Please input dish name' }]}
              >
                <Input placeholder="e.g. Lobster Thermidor" size="large" className="!rounded-xl font-bold" />
              </Form.Item>

              <Form.Item
                name="categoryId"
                label="Menu Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select
                  size="large"
                  className="font-bold"
                  options={categories.map((c) => ({ label: c.name, value: c.id }))}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="price"
                    label="Price ($)"
                    rules={[{ required: true, message: 'Please input price' }]}
                  >
                    <InputNumber min={0.01} step={0.5} size="large" className="w-full !rounded-xl font-bold" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="preparationTime" label="Prep Time (mins)" initialValue={15}>
                    <InputNumber min={1} size="large" className="w-full !rounded-xl font-bold" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="description" label="Description">
                <TextArea rows={3} placeholder="Ingredients, preparation style..." className="!rounded-xl" />
              </Form.Item>

              <Form.Item name="imageUrl" label="Image URL">
                <Input placeholder="https://images.unsplash.com/..." size="large" className="!rounded-xl" />
              </Form.Item>

              <div className="flex gap-4 pt-1 pb-3">
                <Form.Item name="isChefSpecial" valuePropName="checked" className="!mb-0">
                  <Checkbox className="font-semibold text-slate-700">Chef Special ⭐</Checkbox>
                </Form.Item>
                <Form.Item name="isVeg" valuePropName="checked" className="!mb-0">
                  <Checkbox className="font-semibold text-slate-700">Vegetarian 🥗</Checkbox>
                </Form.Item>
                <Form.Item name="isSpicy" valuePropName="checked" className="!mb-0">
                  <Checkbox className="font-semibold text-slate-700">Spicy 🌶️</Checkbox>
                </Form.Item>
              </div>

              <Divider className="!border-slate-200 !my-3" />

              <div className="flex items-center justify-end gap-3 pt-1">
                <Button onClick={() => setIsNewDishOpen(false)} className="!h-10 !px-5 !rounded-xl !border-slate-200 !text-slate-700 font-bold">
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={createMenuItemMutation.isPending}
                  className="!h-10 !px-6 !rounded-xl !bg-gradient-to-r !from-orange-500 !to-amber-500 hover:!from-orange-600 !font-bold border-0 text-white"
                >
                  Save Item
                </Button>
              </div>
            </Form>
          </Modal>
        </div>
      )}

      {/* TAB 4: STAFF & WAITERS */}
      {activeTab === 'staff_mgr' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 p-5 rounded-3xl shadow-sm">
            <div>
              <h3 className="font-black text-base text-slate-900">Waiters & Service Staff</h3>
              <p className="text-xs text-slate-500 font-medium">
                Manage cashier accounts, servers, and assign order receiving waiters.
              </p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsNewStaffOpen(true)}
              className="!h-10 !rounded-xl !bg-gradient-to-r !from-orange-500 !to-amber-500 hover:!from-orange-600 !font-bold !shadow-md border-0 text-white"
            >
              Add Staff Member
            </Button>
          </div>

          {/* Staff Table */}
          <Card className="!bg-white !border-slate-200/90 !rounded-3xl shadow-sm overflow-hidden" styles={{ body: { padding: 0 } }}>
            <Table
              dataSource={staffList}
              columns={staffColumns}
              rowKey="id"
              pagination={{ pageSize: 8 }}
            />
          </Card>

          {/* New Staff Modal */}
          <Modal
            open={isNewStaffOpen}
            onCancel={() => setIsNewStaffOpen(false)}
            footer={null}
            centered
            styles={{ body: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24 } }}
            title={<span className="font-black text-base text-slate-900">Add New Staff Member</span>}
          >
            <Form form={staffForm} layout="vertical" onFinish={handleCreateStaff} className="pt-2">
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter staff name' }]}
              >
                <Input placeholder="e.g. Liam Johnson" size="large" className="!rounded-xl font-bold" />
              </Form.Item>

              <Form.Item
                name="role"
                label="Role"
                initialValue="waiter"
                rules={[{ required: true }]}
              >
                <Select
                  size="large"
                  className="font-bold"
                  options={[
                    { label: 'Waiter / Server', value: 'waiter' },
                    { label: 'Cashier', value: 'cashier' },
                    { label: 'Kitchen Chef', value: 'kitchen' },
                    { label: 'Manager', value: 'manager' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="pinCode"
                label="Login PIN (4-digit)"
                initialValue="1234"
                rules={[{ required: true, message: 'Please enter PIN code' }]}
              >
                <Input placeholder="1234" maxLength={6} size="large" className="!rounded-xl font-bold font-mono" />
              </Form.Item>

              <Form.Item name="email" label="Email Address">
                <Input placeholder="liam@posproject.com" size="large" className="!rounded-xl" />
              </Form.Item>

              <Divider className="!border-slate-200 !my-3" />

              <div className="flex items-center justify-end gap-3 pt-1">
                <Button onClick={() => setIsNewStaffOpen(false)} className="!h-10 !px-5 !rounded-xl !border-slate-200 !text-slate-700 font-bold">
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={createStaffMutation.isPending}
                  className="!h-10 !px-6 !rounded-xl !bg-gradient-to-r !from-orange-500 !to-amber-500 hover:!from-orange-600 !font-bold border-0 text-white"
                >
                  Create Staff
                </Button>
              </div>
            </Form>
          </Modal>
        </div>
      )}

      {/* TAB 5: RESTAURANT / HOTEL SETTINGS */}
      {activeTab === 'hotel_settings' && (
        <div className="space-y-6 max-w-3xl">
          <Card className="!bg-white !border-slate-200/90 !rounded-3xl shadow-sm p-2" title={<span className="font-black text-base text-slate-900">Brand Profile & Tax Configuration</span>}>
            <Form
              form={hotelForm}
              layout="vertical"
              onFinish={(values) => updateHotelMutation.mutate(values)}
            >
              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item
                    name="name"
                    label="Restaurant / Hotel Name"
                    rules={[{ required: true, message: 'Please input restaurant name' }]}
                  >
                    <Input size="large" className="!rounded-xl font-bold" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="currencySymbol"
                    label="Currency Symbol"
                    rules={[{ required: true }]}
                  >
                    <Input size="large" className="!rounded-xl font-bold text-center" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="tagline" label="Tagline / Slogan">
                <Input size="large" className="!rounded-xl" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="taxRate"
                    label="Tax Rate (%)"
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={0} max={100} step={0.1} size="large" className="w-full !rounded-xl font-bold" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="serviceChargeRate"
                    label="Service Charge Rate (%)"
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={0} max={100} step={0.1} size="large" className="w-full !rounded-xl font-bold" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="logoUrl" label="Logo Image URL">
                <Input size="large" className="!rounded-xl" />
              </Form.Item>

              <Form.Item name="address" label="Physical Address">
                <Input size="large" className="!rounded-xl" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="phone" label="Contact Phone">
                    <Input size="large" className="!rounded-xl" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="email" label="Contact Email">
                    <Input size="large" className="!rounded-xl" />
                  </Form.Item>
                </Col>
              </Row>

              <div className="pt-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={updateHotelMutation.isPending}
                  className="!h-11 !px-8 !rounded-xl !bg-gradient-to-r !from-orange-500 !to-amber-500 hover:!from-orange-600 !font-bold border-0 text-white"
                >
                  Save Settings
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      )}
    </div>
  );
}
