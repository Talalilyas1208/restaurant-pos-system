import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { STALE } from '../lib/queryClient';
import { CartState, CartItem } from '../store/slices/cartSlice';
import { StaffUser } from '../types';
import { calculateOrderTotals } from '../utils/calculations';

const FALLBACK_STAFF: StaffUser[] = [
  { id: 'W-101', name: 'Marco Rossi', hotelId: '', role: 'waiter', pinCode: '1001', isActive: true },
  { id: 'W-102', name: 'Sophia Chen', hotelId: '', role: 'waiter', pinCode: '1002', isActive: true },
];

export function usePOSData(cart: CartState) {
  const { data: hotel } = useQuery({
    queryKey: ['hotel'],
    queryFn: ({ signal }) => api.getHotel(undefined, signal),
    staleTime: STALE.HOTEL,
  });

  const { data: staffList = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: ({ signal }) => api.getStaff(signal),
  });

  const activeStaff: StaffUser[] = staffList.length > 0 ? staffList : FALLBACK_STAFF;

  const [selectedWaiter, setSelectedWaiter] = useState<{ id: string; name: string }>({
    id: activeStaff[0].id,
    name: activeStaff[0].name,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: ({ signal }) => api.getCategories(signal),
    staleTime: STALE.MENU,
  });

  const { data: menuItems = [], isLoading: isMenuLoading } = useQuery({
    queryKey: ['menu-items'],
    queryFn: ({ signal }) => api.getMenuItems(undefined, signal),
    staleTime: STALE.MENU,
  });

  const { data: tables = [], isLoading: isTablesLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: ({ signal }) => api.getTables(signal),
    staleTime: STALE.TABLES,
    refetchInterval: STALE.TABLES,
  });

  // Financial Calculations via shared calculateOrderTotals utility
  const taxRate = hotel?.taxRate || 8.5;
  const serviceChargeRate = hotel?.serviceChargeRate || 5.0;
  const totals = calculateOrderTotals(cart.items, taxRate, serviceChargeRate, cart.discountPercent);

  const totalCartQty = cart.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

  return {
    hotel,
    activeStaff,
    selectedWaiter,
    setSelectedWaiter,
    categories,
    menuItems,
    isMenuLoading,
    tables,
    isTablesLoading,
    subtotal: totals.subtotal,
    taxRate,
    tax: totals.tax,
    serviceChargeRate,
    serviceCharge: totals.serviceCharge,
    discountAmount: totals.discountAmount,
    grandTotal: totals.total,
    totalCartQty,
  };
}
