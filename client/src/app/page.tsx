'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Tag, Button, Typography, Row, Col } from 'antd';
import {
  ShoppingOutlined,
  QrcodeOutlined,
  FireOutlined,
  SettingOutlined,
  ArrowRightOutlined,
  DollarOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ShopOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Sparkles, UtensilsCrossed, ChefHat, BarChart3, QrCode } from 'lucide-react';

const { Title, Paragraph, Text } = Typography;

export default function HomePage() {
  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.getAnalytics(),
  });

  const { data: hotel } = useQuery({
    queryKey: ['hotel'],
    queryFn: () => api.getHotel(),
  });

  const { data: tables = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: () => api.getTables(),
  });

  const activeTablesCount = tables?.filter((t) => t.status === 'occupied').length || 0;
  const totalTables = tables?.length || 8;
  const primaryQrToken = tables?.[0]?.qrCodeToken || 'gh-tbl-01';
  const hotelSlug = hotel?.slug || 'pos-project';

  const modules = [
    {
      title: 'POS Cashier Terminal',
      description: 'Touch-optimized order entry, category filters, dish modifiers, waiter assignment, table management, and 80mm thermal receipts.',
      href: '/pos',
      icon: <ShoppingOutlined className="text-2xl text-white" />,
      tag: 'Cashier & Waiters',
      stats: 'Fast Touch Checkout',
      gradient: 'from-orange-500 to-amber-500',
      badgeColor: '!bg-orange-50 !text-orange-700 !border-orange-200',
      borderColor: 'hover:border-orange-400',
    },
    {
      title: 'QR Code Guest Menu',
      description: 'Mobile-first contactless ordering with 3D table food preview, lighting ambiance switches, and instant kitchen routing.',
      href: `/menu/${hotelSlug}/${primaryQrToken}`,
      icon: <QrcodeOutlined className="text-2xl text-white" />,
      tag: 'Contactless Guest',
      stats: 'Zero App Install',
      gradient: 'from-rose-500 to-pink-600',
      badgeColor: '!bg-rose-50 !text-rose-700 !border-rose-200',
      borderColor: 'hover:border-rose-400',
    },
    {
      title: 'Kitchen Display (KDS)',
      description: 'Live order tickets organized by progress columns (Pending, In Kitchen, Ready to Serve) with elapsed timers and audio alerts.',
      href: '/kds',
      icon: <FireOutlined className="text-2xl text-white" />,
      tag: 'Kitchen Line',
      stats: `${analytics?.activeOrders || 3} Active Tickets`,
      gradient: 'from-emerald-500 to-teal-600',
      badgeColor: '!bg-emerald-50 !text-emerald-700 !border-emerald-200',
      borderColor: 'hover:border-emerald-400',
    },
    {
      title: 'Admin & Operations',
      description: 'Manage menu items, categories, pricing, table layouts, export batch branded QR stand cards, and view revenue analytics.',
      href: '/admin',
      icon: <SettingOutlined className="text-2xl text-white" />,
      tag: 'Management',
      stats: 'Revenue & Tables',
      gradient: 'from-purple-500 to-indigo-600',
      badgeColor: '!bg-purple-50 !text-purple-700 !border-purple-200',
      borderColor: 'hover:border-purple-400',
    },
  ];

  return (
    <div className="flex-1 bg-slate-50 text-slate-900 p-6 md:p-10 space-y-8 max-w-7xl mx-auto w-full">
      {/* Hero Banner (White surface with subtle RGB ambient gradients) */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-8 md:p-10 shadow-sm">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-gradient-to-br from-orange-400/10 via-rose-400/10 to-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <Tag color="orange" className="!px-3 !py-1 !rounded-full !text-xs !font-bold !border-orange-200 !bg-orange-50 !text-orange-700">
            <Sparkles className="w-3.5 h-3.5 inline mr-1 text-orange-500" /> Complete Restaurant POS & Digital QR Dining System
          </Tag>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Next-Gen Restaurant Operating Platform
          </h1>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            High-speed POS, real-time Kitchen Display (KDS), and contactless QR table ordering with porcelain plate preview and waiter assignment.
          </p>

          {/* Quick RGB Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            {/* Metric 1: Green */}
            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 shadow-sm">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Today Sales</span>
              <div className="text-2xl font-black text-emerald-700 pt-1">
                ${analytics?.todayRevenue ? analytics.todayRevenue.toFixed(2) : '1,548.50'}
              </div>
            </div>

            {/* Metric 2: Orange */}
            <div className="bg-orange-50/70 p-4 rounded-2xl border border-orange-200/80 shadow-sm">
              <span className="text-[11px] font-bold text-orange-800 uppercase tracking-wider block">Active Orders</span>
              <div className="text-2xl font-black text-orange-600 pt-1">
                {analytics?.activeOrders || 3} Orders
              </div>
            </div>

            {/* Metric 3: Blue */}
            <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200/80 shadow-sm">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">Floor Occupancy</span>
              <div className="text-2xl font-black text-blue-700 pt-1">
                {activeTablesCount} / {totalTables} Tables
              </div>
            </div>

            {/* Metric 4: Purple */}
            <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200/80 shadow-sm">
              <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">Avg. Ticket</span>
              <div className="text-2xl font-black text-purple-700 pt-1">
                ${analytics?.averageOrderValue ? analytics.averageOrderValue.toFixed(2) : '42.80'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Module Navigation Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <ShopOutlined className="text-orange-500" /> Operational Workspaces
          </h2>
          <span className="text-xs font-semibold text-slate-500">Select a workspace module</span>
        </div>

        <Row gutter={[20, 20]}>
          {modules.map((mod) => (
            <Col xs={24} md={12} key={mod.title}>
              <Link href={mod.href} className="block h-full">
                <Card
                  hoverable
                  className={`!bg-white !border-slate-200/90 ${mod.borderColor} !rounded-3xl transition-all shadow-sm hover:shadow-md h-full flex flex-col justify-between group overflow-hidden`}
                  styles={{ body: { padding: '24px' } }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${mod.gradient} flex items-center justify-center shadow-md shadow-orange-500/10 group-hover:scale-110 transition-transform`}>
                        {mod.icon}
                      </div>
                      <Tag className={`!m-0 !text-xs !font-bold !rounded-lg !px-2.5 !py-0.5 ${mod.badgeColor}`}>
                        {mod.tag}
                      </Tag>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {mod.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
                      {mod.stats}
                    </span>
                    <span className="text-xs font-black text-orange-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Open Workspace <ArrowRightOutlined />
                    </span>
                  </div>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}
