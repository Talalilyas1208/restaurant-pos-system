'use client';

import React from 'react';
import { Card, Table, Tag, Switch, Space, Popconfirm, Button } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { MenuItem, Category } from '../../types';

interface AdminMenuTabProps {
  menuItems: MenuItem[];
  categories: Category[];
  onOpenNewDish: () => void;
  onDeleteDish: (id: string) => void;
  onToggleStock: (id: string, isAvailable: boolean) => void;
}

export default function AdminMenuTab({
  menuItems,
  categories,
  onOpenNewDish,
  onDeleteDish,
  onToggleStock,
}: AdminMenuTabProps) {
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
      render: (_: unknown, record: MenuItem) => (
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
      render: (_: unknown, record: MenuItem) => (
        <Switch
          checkedChildren="In Stock"
          unCheckedChildren="86 Sold Out"
          checked={record.isAvailable}
          onChange={(checked) => onToggleStock(record.id, checked)}
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right' as const,
      render: (_: unknown, record: MenuItem) => (
        <Popconfirm
          title="Delete dish?"
          description={`Are you sure you want to remove "${record.name}"?`}
          onConfirm={() => onDeleteDish(record.id)}
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
          onClick={onOpenNewDish}
          className="!h-10 !rounded-xl !bg-gradient-to-r !from-orange-500 !to-amber-500 hover:!from-orange-600 !font-bold !shadow-md border-0 text-white"
        >
          Add New Dish
        </Button>
      </div>

      <Card className="!bg-white !border-slate-200/90 !rounded-3xl shadow-sm overflow-hidden" styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={menuItems}
          columns={dishColumns}
          rowKey="id"
          pagination={{ pageSize: 8 }}
        />
      </Card>
    </div>
  );
}
