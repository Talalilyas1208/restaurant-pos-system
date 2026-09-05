'use client';

import React from 'react';
import { useKDSOrders } from '../../hooks/useKDSOrders';
import KDSHeader from '../../components/kds/KDSHeader';
import KDSTicketColumn from '../../components/kds/KDSTicketColumn';

export default function KDSPage() {
  const {
    filterType,
    setFilterType,
    soundEnabled,
    setSoundEnabled,
    isFetching,
    refetch,
    activeOrders,
    pendingOrders,
    preparingOrders,
    readyOrders,
    getElapsedMinutes,
    handleUpdateStatus,
    isUpdating,
  } = useKDSOrders();

  return (
    <div className="flex-1 bg-slate-100 text-slate-900 flex flex-col h-full overflow-hidden">
      <KDSHeader
        activeCount={activeOrders.length}
        filterType={filterType}
        onFilterChange={setFilterType}
        isFetching={isFetching}
        onRefetch={refetch}
        soundEnabled={soundEnabled}
        onToggleSound={setSoundEnabled}
      />

      {/* Kanban Ticket Columns */}
      <div className="flex-1 p-3 md:p-4 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto md:overflow-hidden">
        <KDSTicketColumn
          title="1. NEW TICKETS"
          badgeText="Action Required"
          badgeColor="warning"
          pulseColor="bg-amber-500 animate-ping"
          columnBg="bg-amber-50/70"
          borderClass="border-amber-200"
          headerBg="bg-amber-100/90"
          titleColor="text-amber-900"
          orders={pendingOrders}
          emptyTitle="No new tickets"
          emptyDescription="New guest and waiter orders will pop up here."
          emptyBg="!bg-amber-50/40"
          emptyBorder="!border-amber-100"
          getElapsedMinutes={getElapsedMinutes}
          onUpdateStatus={handleUpdateStatus}
          isUpdating={isUpdating}
        />

        <KDSTicketColumn
          title="2. IN KITCHEN"
          badgeText="Cooking"
          badgeColor="processing"
          pulseColor="bg-blue-500 animate-pulse"
          columnBg="bg-blue-50/70"
          borderClass="border-blue-200"
          headerBg="bg-blue-100/90"
          titleColor="text-blue-900"
          orders={preparingOrders}
          emptyTitle="No dishes cooking"
          emptyDescription="Move tickets here when preparation begins."
          emptyBg="!bg-blue-50/40"
          emptyBorder="!border-blue-100"
          getElapsedMinutes={getElapsedMinutes}
          onUpdateStatus={handleUpdateStatus}
          isUpdating={isUpdating}
        />

        <KDSTicketColumn
          title="3. READY TO SERVE"
          badgeText="Ready"
          badgeColor="success"
          pulseColor="bg-emerald-500"
          columnBg="bg-emerald-50/70"
          borderClass="border-emerald-200"
          headerBg="bg-emerald-100/90"
          titleColor="text-emerald-900"
          orders={readyOrders}
          emptyTitle="No ready orders"
          emptyDescription="Orders ready for waiter pickup will appear here."
          emptyBg="!bg-emerald-50/40"
          emptyBorder="!border-emerald-100"
          getElapsedMinutes={getElapsedMinutes}
          onUpdateStatus={handleUpdateStatus}
          isUpdating={isUpdating}
        />
      </div>
    </div>
  );
}
