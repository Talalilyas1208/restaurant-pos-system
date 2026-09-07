'use client';

import React from 'react';
import { Card, Table, Tag, Popconfirm, Button } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { StaffUser } from '../../types';

interface AdminStaffTabProps {
  staffList: StaffUser[];
  onOpenNewStaff: () => void;
  onDeleteStaff: (id: string) => void;
}

export default function AdminStaffTab({
  staffList,
  onOpenNewStaff,
  onDeleteStaff,
}: AdminStaffTabProps) {
  const staffColumns = [
    {
      title: 'Staff ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <Tag color="orange" className="!font-mono !font-bold !rounded-md">{id}</Tag>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span className="font-bold text-slate-900">{name}</span>,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color="blue" className="!font-bold capitalize !rounded-md">
          {role}
        </Tag>
      ),
    },
    {
      title: 'Login PIN',
      dataIndex: 'pinCode',
      key: 'pinCode',
      render: () => <span className="font-mono text-slate-600 font-bold">••••</span>,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'default'} className="!rounded-md font-bold">
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right' as const,
      render: (_: unknown, record: StaffUser) => (
        <Popconfirm
          title="Delete staff member?"
          description={`Remove ${record.name} from staff list?`}
          onConfirm={() => onDeleteStaff(record.id)}
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
          <h3 className="font-black text-base text-slate-900">Waiters & Service Staff</h3>
          <p className="text-xs text-slate-500 font-medium">
            Manage cashier accounts, servers, and assign order receiving waiters.
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onOpenNewStaff}
          className="!h-10 !rounded-xl !bg-gradient-to-r !from-orange-500 !to-amber-500 hover:!from-orange-600 !font-bold !shadow-md border-0 text-white"
        >
          Add Staff Member
        </Button>
      </div>

      <Card className="!bg-white !border-slate-200/90 !rounded-3xl shadow-sm overflow-hidden" styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={staffList}
          columns={staffColumns}
          rowKey="id"
          pagination={{ pageSize: 8 }}
        />
      </Card>
    </div>
  );
}

