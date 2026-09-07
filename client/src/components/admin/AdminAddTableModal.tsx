'use client';

import React from 'react';
import { Modal, Form, Input, InputNumber, Select, Divider, Button } from 'antd';

export interface CreateTableFormValues {
  tableNumber: string;
  section: string;
  capacity: number;
}

interface AdminAddTableModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateTableFormValues) => void;
  loading: boolean;
}

export default function AdminAddTableModal({
  open,
  onClose,
  onSubmit,
  loading,
}: AdminAddTableModalProps) {
  const [form] = Form.useForm();

  const handleFinish = (values: CreateTableFormValues) => {
    onSubmit(values);
    form.resetFields();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      styles={{ body: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24 } }}
      title={<span className="font-black text-base text-slate-900">Add New Dining Table or Room</span>}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} className="pt-2">
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
          <Button onClick={onClose} className="!h-10 !px-5 !rounded-xl !border-slate-200 !text-slate-700 font-bold">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="!h-10 !px-6 !rounded-xl !bg-gradient-to-r !from-orange-500 !to-amber-500 hover:!from-orange-600 !font-bold border-0 text-white"
          >
            Create & Generate QR
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

