'use client';

import React, { useEffect } from 'react';
import { Card, Form, Row, Col, Input, InputNumber, Button } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { Hotel } from '../../types';

interface AdminSettingsTabProps {
  hotel: Hotel | undefined;
  onSubmit: (values: Partial<Hotel>) => void;
  loading: boolean;
}

export default function AdminSettingsTab({
  hotel,
  onSubmit,
  loading,
}: AdminSettingsTabProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (hotel) {
      form.setFieldsValue({
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
  }, [hotel, form]);

  return (
    <div className="space-y-6 max-w-3xl">
      <Card
        className="!bg-white !border-slate-200/90 !rounded-3xl shadow-sm p-2"
        title={<span className="font-black text-base text-slate-900">Brand Profile & Tax Configuration</span>}
      >
        <Form form={form} layout="vertical" onFinish={onSubmit}>
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
              loading={loading}
              className="!h-11 !px-8 !rounded-xl !bg-gradient-to-r !from-orange-500 !to-amber-500 hover:!from-orange-600 !font-bold border-0 text-white"
            >
              Save Settings
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

