'use client';

import React from 'react';
import Link from 'next/link';
import {
  UtensilsCrossed,
  Receipt,
  QrCode,
  ChefHat,
  BarChart3,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Smartphone,
  Layers,
  Database,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

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
      title: 'POS Terminal',
      description: 'Lightning-fast cashier & waiter order entry, table locking, modifier selections, split bills & thermal receipt printing.',
      href: '/pos',
      icon: Receipt,
      color: 'from-blue-600 to-cyan-600',
      badge: 'Live Operations',
      stats: 'Instant Touch Checkout',
    },
    {
      title: 'QR Code Digital Menu',
      description: 'Mobile-first contactless guest ordering. Customers scan table QR code to customize dishes and order directly to the kitchen.',
      href: '/menu/grand-horizon/gh-tbl-01',
      icon: QrCode,
      color: 'from-orange-600 to-amber-600',
      badge: 'Guest Facing',
      stats: 'Zero App Download',
    },
    {
      title: 'Kitchen Display (KDS)',
      description: 'Real-time kitchen order tickets with status columns (Pending, Preparing, Ready), elapsed timers and audio alerts.',
      href: '/kds',
      icon: ChefHat,
      color: 'from-emerald-600 to-teal-600',
      badge: 'Kitchen Flow',
      stats: `${analytics?.activeOrders || 2} Active Tickets`,
    },
    {
      title: 'Admin & QR Generator',
      description: 'Manage menu items, categories, pricing, table layouts, batch QR stand card exports, and real-time revenue reports.',
      href: '/admin',
      icon: BarChart3,
      color: 'from-purple-600 to-indigo-600',
      badge: 'Management',
      stats: 'Revenue & Tables',
    },
  ];

  return (
    <div className="flex-1 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 md:p-10 space-y-10 max-w-7xl mx-auto w-full">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Hotel & Restaurant OS
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Seamless POS, Kitchen Display & Contactless QR Menu
          </h1>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed">
            All-in-one platform engineered with Next.js, TypeScript, Redux Toolkit Persist, TanStack React Query,
            Express.js and Supabase database.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-700/60">
            <div>
              <span className="text-xs text-slate-400">Today Sales</span>
              <p className="text-xl font-bold text-emerald-400">
                ${analytics?.todayRevenue ? analytics.todayRevenue.toFixed(2) : '1,548.50'}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Active Orders</span>
              <p className="text-xl font-bold text-orange-400">{analytics?.activeOrders || 3} Orders</p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Table Occupancy</span>
              <p className="text-xl font-bold text-blue-400">
                {activeTablesCount} / {totalTables} Tables
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Avg. Order Value</span>
              <p className="text-xl font-bold text-purple-400">
                ${analytics?.averageOrderValue ? analytics.averageOrderValue.toFixed(2) : '42.80'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Module Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-400" /> Platform Workspaces
          </h2>
          <span className="text-xs text-slate-400">Choose a terminal role to start</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.title}
                href={mod.href}
                className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 hover:border-orange-500/50 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                      {mod.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors flex items-center gap-2">
                      {mod.title}
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange-400" />
                    </h3>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">{mod.description}</p>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">{mod.stats}</span>
                  <span className="text-orange-400 font-medium group-hover:underline">Launch App &rarr;</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tech Stack Breakdown */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-base text-slate-200 flex items-center gap-2">
          <Database className="w-4 h-4 text-orange-400" /> Technology Architecture & State Flow
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1">
            <span className="font-bold text-orange-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Frontend Architecture
            </span>
            <p className="text-slate-300">Next.js 14 App Router, React 18, TypeScript, Tailwind CSS with touch-optimized POS views.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1">
            <span className="font-bold text-blue-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> State & Persistence
            </span>
            <p className="text-slate-300">Redux Toolkit with Redux-Persist (offline cart drafts) & TanStack React Query cache synchronization.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" /> Express.js Backend
            </span>
            <p className="text-slate-300">Layered REST API (Controllers, Services, Routes) with Zod validation and structured error handling.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1">
            <span className="font-bold text-purple-400 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" /> Supabase & QR Engine
            </span>
            <p className="text-slate-300">PostgreSQL schema, seed data, QR code token generation & printable table stand export.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
