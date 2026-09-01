'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Statistic, Row, Col, Tag, Button, Typography, Space } from 'antd';
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
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Sparkles, UtensilsCrossed } from 'lucide-react';

const { Title, Paragraph, Text } = Typography;

export default function HomePage() {
  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.getAnalytics(),
  });

  const { data: tables } = useQuery({
    queryKey: ['tables'],
    queryFn: () => api.getTables(),
  });

  const activeTablesCount = tables?.filter((t) => t.status === 'occupied').length || 0;
  const totalTables = tables?.length || 8;

  const modules = [
    {
      title: 'POS Cashier Terminal',
      description: 'Touch-optimized order entry, category filters, dish modifiers, table management, split bills, and 80mm thermal receipts.',
      href: '/pos',
      icon: <ShoppingOutlined className="text-2xl text-orange-400" />,
      tag: 'Cashier & Waiters',
      stats: 'Instant Touch Checkout',
      color: '#f97316',
    },
    {
      title: 'QR Code Guest Menu',
      description: 'Mobile-first contactless ordering. Diners scan their table QR code to browse gourmet dishes and order directly.',
      href: '/menu/grand-horizon/gh-tbl-01',
      icon: <QrcodeOutlined className="text-2xl text-amber-400" />,
      tag: 'Contactless Guest',
      stats: 'Zero App Install',
      color: '#f59e0b',
    },
    {
      title: 'Kitchen Display (KDS)',
      description: 'Real-time order tickets organized by progress columns (Pending, Preparing, Ready) with elapsed timers and audio alerts.',
      href: '/kds',
      icon: <FireOutlined className="text-2xl text-emerald-400" />,
      tag: 'Kitchen Line',
      stats: `${analytics?.activeOrders || 2} Active Tickets`,
      color: '#10b981',
    },
    {
      title: 'Admin & Operations',
      description: 'Manage menu items, categories, pricing, table layouts, export batch branded QR stand cards, and view revenue analytics.',
      href: '/admin',
      icon: <SettingOutlined className="text-2xl text-purple-400" />,
      tag: 'Hotel Management',
      stats: 'Revenue & Tables',
      color: '#8b5cf6',
    },
  ];

  return (
    <div className="flex-1 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 md:p-10 space-y-8 max-w-7xl mx-auto w-full">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 p-8 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4 max-w-3xl">
          <Tag color="orange" className="!px-3 !py-1 !rounded-full !text-xs !font-semibold border-orange-500/40">
            <Sparkles className="w-3.5 h-3.5 inline mr-1" /> Ant Design & Tailwind Powered POS Platform
          </Tag>
          
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Hotel & Restaurant POS & Contactless QR Menu
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Enterprise restaurant operating system built with Next.js 14, Ant Design 5, TypeScript, Redux Toolkit Persist,
            TanStack React Query, and Express.js with Supabase backend.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-700/60">
            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400">Today Sales</span>
              <div className="text-xl font-bold text-emerald-400 pt-0.5">
                ${analytics?.todayRevenue ? analytics.todayRevenue.toFixed(2) : '1,548.50'}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400">Active Orders</span>
              <div className="text-xl font-bold text-orange-400 pt-0.5">
                {analytics?.activeOrders || 3} Orders
              </div>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400">Floor Occupancy</span>
              <div className="text-xl font-bold text-blue-400 pt-0.5">
                {activeTablesCount} / {totalTables} Tables
              </div>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400">Avg. Ticket</span>
              <div className="text-xl font-bold text-purple-400 pt-0.5">
                ${analytics?.averageOrderValue ? analytics.averageOrderValue.toFixed(2) : '42.80'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Module Navigation Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShopOutlined className="text-orange-400" /> Platform Workspaces
          </h2>
          <span className="text-xs text-slate-400">Select a workspace role</span>
        </div>

        <Row gutter={[20, 20]}>
          {modules.map((mod) => (
            <Col xs={24} md={12} key={mod.title}>
              <Link href={mod.href} className="block h-full">
                <Card
                  hoverable
                  className="!bg-slate-900 !border-slate-800 hover:!border-orange-500/60 !rounded-2xl transition-all shadow-xl h-full flex flex-col justify-between group"
                  styles={{ body: { padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' } }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {mod.icon}
                      </div>
                      <Tag color="orange" className="!rounded-full !px-3 !text-xs font-semibold">
                        {mod.tag}
                      </Tag>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors flex items-center gap-2">
                        {mod.title}
                        <ArrowRightOutlined className="text-xs opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange-400" />
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{mod.description}</p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{mod.stats}</span>
                    <Button
                      type="link"
                      className="!text-orange-400 !p-0 !font-semibold group-hover:underline"
                    >
                      Open Terminal &rarr;
                    </Button>
                  </div>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </div>

      {/* Tech Architecture Badges */}
      <Card className="!bg-slate-900/60 !border-slate-800/90 !rounded-2xl shadow-lg">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-200">
            <ThunderboltOutlined className="text-orange-400" /> Architecture & State Flow
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/40">
              <span className="font-bold text-orange-400 block mb-1">Ant Design 5 & Tailwind</span>
              <p className="text-slate-300">Unified dark tokens, SSR registry, accessible responsive inputs.</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/40">
              <span className="font-bold text-blue-400 block mb-1">Redux Toolkit Persist</span>
              <p className="text-slate-300">Offline cart drafts & terminal cashier session persistence.</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/40">
              <span className="font-bold text-emerald-400 block mb-1">Express.js Layered REST</span>
              <p className="text-slate-300">Controllers, services, Zod validation, and error middlewares.</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/40">
              <span className="font-bold text-purple-400 block mb-1">Supabase & QR Engine</span>
              <p className="text-slate-300">PostgreSQL schema, seed scripts, and printable QR table stands.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
