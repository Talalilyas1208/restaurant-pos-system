'use client';

import React from 'react';
import { Modal, Form, Input, InputNumber, Select, Row, Col, Checkbox, Divider, Button } from 'antd';
import { Category } from '../../types';

const { TextArea } = Input;

export interface CreateDishFormValues {
  name: string;
  categoryId: string;
  price: number;
  preparationTime?: number;
  description?: string;
  imageUrl?: string;
  isChefSpecial?: boolean;
  isVeg?: boolean;
  isSpicy?: boolean;
}

interface AdminAddDishModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateDishFormValues) => void;
  categories: Category[];
  loading: boolean;
}

export default function AdminAddDishModal({
  open,
  onClose,
  onSubmit,
  categories,
  loading,
}: AdminAddDishModalProps) {
  const [form] = Form.useForm();

  const handleFinish = (values: CreateDishFormValues) => {
    onSubmit(values);
    form.resetFields();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={520}
      centered
      styles={{ body: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24 } }}
      title={<span className="font-black text-base text-slate-900">Add New Gourmet Item</span>}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} className="pt-2">
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
          <Button onClick={onClose} className="!h-10 !px-5 !rounded-xl !border-slate-200 !text-slate-700 font-bold">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="!h-10 !px-6 !rounded-xl !bg-gradient-to-r !from-orange-500 !to-amber-500 hover:!from-orange-600 !font-bold border-0 text-white"
          >
            Save Item
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

