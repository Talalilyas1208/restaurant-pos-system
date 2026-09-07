'use client';

import React from 'react';
import { Modal, Form, Input, Select, Divider, Button } from 'antd';

export interface CreateStaffFormValues {
  name: string;
  role: string;
  pinCode: string;
  email?: string;
}

interface AdminAddStaffModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateStaffFormValues) => void;
  loading: boolean;
}

export default function AdminAddStaffModal({
  open,
  onClose,
  onSubmit,
  loading,
}: AdminAddStaffModalProps) {
  const [form] = Form.useForm();

  const handleFinish = (values: CreateStaffFormValues) => {
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
      title={<span className="font-black text-base text-slate-900">Add New Staff Member</span>}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} className="pt-2">
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
          <Button onClick={onClose} className="!h-10 !px-5 !rounded-xl !border-slate-200 !text-slate-700 font-bold">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="!h-10 !px-6 !rounded-xl !bg-gradient-to-r !from-orange-500 !to-amber-500 hover:!from-orange-600 !font-bold border-0 text-white"
          >
            Create Staff
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

