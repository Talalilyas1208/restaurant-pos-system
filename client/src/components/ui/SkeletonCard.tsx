'use client';

import React from 'react';
import { Card, Skeleton } from 'antd';

export default function SkeletonCard() {
  return (
    <Card
      className="!bg-white !rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden"
      styles={{
        body: {
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between',
        },
      }}
    >
      <div className="space-y-3">
        <Skeleton.Image active className="!w-full !h-32 !rounded-2xl" />
        <Skeleton active paragraph={{ rows: 2 }} title={{ width: '60%' }} />
      </div>
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <Skeleton.Button active size="small" className="!w-16" />
        <Skeleton.Button active size="small" shape="circle" />
      </div>
    </Card>
  );
}

