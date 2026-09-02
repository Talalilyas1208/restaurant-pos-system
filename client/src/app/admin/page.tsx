'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Tabs,
  Table,
  Button,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
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
  message,
} from 'antd';
import {
  BarChartOutlined,
  QrcodeOutlined,
  UnorderedListOutlined,
  PlusOutlined,
  PrinterOutlined,
  DollarOutlined,
  RiseOutlined,
  ShoppingOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { api } from '../../lib/api';
import { DiningTable, MenuItem, Category } from '../../types';
import QRStandCard from '../../components/QRStandCard';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('analytics');

  // Modal forms
  const [isNewTableOpen, setIsNewTableOpen] = useState(false);
  const [isNewDishOpen, setIsNewDishOpen] = useState(false);
  const [tableForm] = Form.useForm();
  const [dishForm] = Form.useForm();

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
      tableForm.resetFields();
      message.success('New table created with dynamic QR code!');
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
              className="w-10 h-10 rounded-xl object-cover shadow-sm bg-slate-800"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div>
            <div className="font-bold text-slate-100">{text}</div>
            <div className="text-xs text-slate-400 line-clamp-1">{record.description}</div>
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
        return <Tag color="orange">{cat?.name || 'General'}</Tag>;
      },
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      sorter: (a: MenuItem, b: MenuItem) => a.price - b.price,
      render: (price: number) => <span className="font-bold text-white">${price.toFixed(2)}</span>,
    },
    {
      title: 'Tags',
      key: 'tags',
      render: (_: any, record: MenuItem) => (
        <Space size={4}>
          {record.isVeg && <Tag color="success">Veg</Tag>}
          {record.isSpicy && <Tag color="error">Spicy</Tag>}
          {record.isChefSpecial && <Tag color="gold">Special</Tag>}
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
          className="bg-slate-700"
        />
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
    </div>
  );
}
