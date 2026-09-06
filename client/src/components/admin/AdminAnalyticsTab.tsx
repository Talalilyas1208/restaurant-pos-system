'use client';

import React from 'react';
import { Row, Col, Card, Tag } from 'antd';
import { AnalyticsSummary, DiningTable } from '../../types';
import { MetricCard } from '../ui';

interface AdminAnalyticsTabProps {
  analytics: AnalyticsSummary | undefined;
  tables: DiningTable[];
}

export default function AdminAnalyticsTab({ analytics, tables }: AdminAnalyticsTabProps) {
  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;

  return (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Today Revenue"
            value={`$${analytics?.todayRevenue ? analytics.todayRevenue.toFixed(2) : '1,548.50'}`}
            subtitle="Dine-in & Bar"
            color="emerald"
            trend={{ value: '+14.2% vs yesterday', isPositive: true }}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Total Orders"
            value={`${analytics?.totalOrdersToday || 34} Orders`}
            subtitle="Dine-in & Room Service"
            color="orange"
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Occupied Tables"
            value={`${occupiedCount} / ${tables.length}`}
            subtitle="Real-time floor state"
            color="blue"
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Avg. Order Value"
            value={`$${analytics?.averageOrderValue ? analytics.averageOrderValue.toFixed(2) : '42.80'}`}
            subtitle="Per guest checkout"
            color="purple"
          />
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
  );
}
