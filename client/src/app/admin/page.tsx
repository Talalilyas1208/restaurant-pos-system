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
    <div className="flex-1 bg-slate-950 text-slate-100 p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin & Operations Portal</h1>
          <p className="text-xs text-slate-400">
            {hotel?.name || 'Grand Horizon Bistro'} &bull; Restaurant Settings, QR Stands & Analytics
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
          className="custom-antd-tabs"
        />
      </div>

      {/* TAB 1: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card className="!bg-slate-900 !border-slate-800 !rounded-2xl shadow-xl">
                <Statistic
                  title={<Text className="!text-slate-400 !text-xs uppercase font-semibold">Today Revenue</Text>}
                  value={analytics?.todayRevenue ? analytics.todayRevenue : 1548.5}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: '#22c55e', fontWeight: 'bold' }}
                />
                <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-semibold">
                  <RiseOutlined /> +14.2% vs yesterday
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="!bg-slate-900 !border-slate-800 !rounded-2xl shadow-xl">
                <Statistic
                  title={<Text className="!text-slate-400 !text-xs uppercase font-semibold">Total Orders</Text>}
                  value={analytics?.totalOrdersToday || 34}
                  suffix="Orders"
                  valueStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                />
                <div className="text-[11px] text-slate-400 mt-2">Dine-in & Room Service</div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="!bg-slate-900 !border-slate-800 !rounded-2xl shadow-xl">
                <Statistic
                  title={<Text className="!text-slate-400 !text-xs uppercase font-semibold">Occupied Tables</Text>}
                  value={tables.filter((t) => t.status === 'occupied').length}
                  suffix={`/ ${tables.length}`}
                  valueStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
                />
                <div className="text-[11px] text-blue-400 mt-2">Real-time floor state</div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="!bg-slate-900 !border-slate-800 !rounded-2xl shadow-xl">
                <Statistic
                  title={<Text className="!text-slate-400 !text-xs uppercase font-semibold">Avg. Order Value</Text>}
                  value={analytics?.averageOrderValue ? analytics.averageOrderValue : 42.8}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: '#c084fc', fontWeight: 'bold' }}
                />
                <div className="text-[11px] text-slate-400 mt-2">Per guest checkout</div>
              </Card>
            </Col>
          </Row>

          {/* Popular Dishes & Hourly Volume */}
          <Row gutter={[20, 20]}>
            <Col xs={24} lg={12}>
              <Card
                className="!bg-slate-900 !border-slate-800 !rounded-2xl shadow-xl"
                title={<span className="font-bold text-base text-white">Top Performing Dishes</span>}
              >
                <div className="space-y-3">
                  {analytics?.popularItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <Tag color="orange" className="!font-bold !text-xs">
                          #{idx + 1}
                        </Tag>
                        <span className="font-semibold text-sm text-slate-100">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm text-white">${item.revenue.toFixed(2)}</div>
                        <span className="text-xs text-slate-400">{item.quantity} orders</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                className="!bg-slate-900 !border-slate-800 !rounded-2xl shadow-xl"
                title={<span className="font-bold text-base text-white">Peak Hours Sales Volume</span>}
              >
                <div className="space-y-3 pt-1">
                  {analytics?.hourlySales.map((slot, idx) => {
                    const maxSales = 1400;
                    const percentage = Math.min(100, (slot.sales / maxSales) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-300">
                          <span className="font-mono">{slot.hour}</span>
                          <span className="font-bold text-orange-400">${slot.sales}</span>
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
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* TAB 2: QR STAND GENERATOR */}
      {activeTab === 'qr_generator' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
            <div>
              <h3 className="font-bold text-base text-white">Table Stand QR Generator</h3>
              <p className="text-xs text-slate-400">
                Generate high-resolution printable table cards with embedded menu deep-links.
              </p>
            </div>
            <Space>
              <Button
                icon={<PrinterOutlined />}
                onClick={() => window.print()}
                className="!h-10 !rounded-xl !border-slate-700 !bg-slate-800 !text-slate-200"
              >
                Print All Stands
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsNewTableOpen(true)}
                className="!h-10 !rounded-xl !bg-orange-500 !font-semibold !shadow-lg !shadow-orange-500/25"
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
                hotel={hotel || ({ name: 'Grand Horizon Bistro', slug: 'grand-horizon' } as any)}
              />
            ))}
          </div>

          {/* New Table Modal */}
          <Modal
            open={isNewTableOpen}
            onCancel={() => setIsNewTableOpen(false)}
            footer={null}
            centered
            title={<span className="font-bold text-base text-slate-100">Add New Dining Table or Room</span>}
          >
            <Form form={tableForm} layout="vertical" onFinish={handleCreateTable} className="pt-2">
              <Form.Item
                name="tableNumber"
                label="Table or Room Number"
                rules={[{ required: true, message: 'Please input table number' }]}
              >
                <Input placeholder="e.g. T-09 or Room 302" size="large" />
              </Form.Item>

              <Form.Item
                name="section"
                label="Dining Section"
                initialValue="Main Dining"
                rules={[{ required: true }]}
              >
                <Select
                  size="large"
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
                <InputNumber min={1} max={20} size="large" className="w-full" />
              </Form.Item>

              <Divider className="!border-slate-800 !my-3" />

              <div className="flex items-center justify-end gap-3 pt-1">
                <Button onClick={() => setIsNewTableOpen(false)} className="!h-10 !px-5 !rounded-xl !border-slate-700 !text-slate-300">
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={createTableMutation.isPending}
                  className="!h-10 !px-6 !rounded-xl !bg-orange-500 !font-bold"
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
            <div>
              <h3 className="font-bold text-base text-white">Menu Catalog & Dish Inventory</h3>
              <p className="text-xs text-slate-400">
                Update prices, toggle instant 86 / out-of-stock status, and add gourmet creations.
              </p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsNewDishOpen(true)}
              className="!h-10 !rounded-xl !bg-orange-500 !font-semibold !shadow-lg !shadow-orange-500/25"
            >
              Add New Dish
            </Button>
          </div>

          {/* Ant Design Table */}
          <Card className="!bg-slate-900 !border-slate-800 !rounded-2xl shadow-xl overflow-hidden" styles={{ body: { padding: 0 } }}>
            <Table
              dataSource={menuItems}
              columns={dishColumns}
              rowKey="id"
              pagination={{ pageSize: 8 }}
              className="custom-antd-table"
            />
          </Card>

          {/* New Dish Modal */}
          <Modal
            open={isNewDishOpen}
            onCancel={() => setIsNewDishOpen(false)}
            footer={null}
            width={520}
            centered
            title={<span className="font-bold text-base text-slate-100">Add New Gourmet Item</span>}
          >
            <Form form={dishForm} layout="vertical" onFinish={handleCreateDish} className="pt-2">
              <Form.Item
                name="name"
                label="Dish Name"
                rules={[{ required: true, message: 'Please input dish name' }]}
              >
                <Input placeholder="e.g. Lobster Thermidor" size="large" />
              </Form.Item>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    name="categoryId"
                    label="Category"
                    initialValue={categories[0]?.id}
                    rules={[{ required: true }]}
                  >
                    <Select
                      size="large"
                      options={categories.map((c) => ({ label: c.name, value: c.id }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="price"
                    label="Price ($)"
                    initialValue={15}
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={1} step={0.5} size="large" className="w-full" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="description" label="Description">
                <TextArea rows={2} placeholder="Rich description of recipe and flavors..." />
              </Form.Item>

              <Form.Item name="imageUrl" label="Image URL (Unsplash or CDN)">
                <Input placeholder="https://images.unsplash.com/..." size="large" />
              </Form.Item>

              <div className="flex items-center gap-4 pt-1 pb-2">
                <Form.Item name="isVeg" valuePropName="checked" className="!mb-0">
                  <Checkbox className="!text-slate-200 !text-xs">Vegetarian</Checkbox>
                </Form.Item>
                <Form.Item name="isSpicy" valuePropName="checked" className="!mb-0">
                  <Checkbox className="!text-slate-200 !text-xs">Spicy</Checkbox>
                </Form.Item>
                <Form.Item name="isChefSpecial" valuePropName="checked" className="!mb-0">
                  <Checkbox className="!text-slate-200 !text-xs">Chef Special</Checkbox>
                </Form.Item>
              </div>

              <Divider className="!border-slate-800 !my-3" />

              <div className="flex items-center justify-end gap-3 pt-1">
                <Button onClick={() => setIsNewDishOpen(false)} className="!h-10 !px-5 !rounded-xl !border-slate-700 !text-slate-300">
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={createMenuItemMutation.isPending}
                  className="!h-10 !px-6 !rounded-xl !bg-orange-500 !font-bold"
                >
                  Add Dish to Menu
                </Button>
              </div>
            </Form>
          </Modal>
        </div>
      )}
    </div>
  );
}
