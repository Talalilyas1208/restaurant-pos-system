import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { STALE } from '../lib/queryClient';
import { CartState, CartItem } from '../store/slices/cartSlice';
import { StaffUser } from '../types';

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

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu-items'],
    queryFn: ({ signal }) => api.getMenuItems(undefined, signal),
    staleTime: STALE.MENU,
  });

  const { data: tables = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: ({ signal }) => api.getTables(signal),
    staleTime: STALE.TABLES,
    refetchInterval: STALE.TABLES,
  });

  // Financial Calculations
  const subtotal = cart.items.reduce((sum: number, item: CartItem) => sum + item.totalPrice, 0);
  const taxRate = hotel?.taxRate || 8.5;
  const serviceChargeRate = hotel?.serviceChargeRate || 5.0;
  const discountAmount = parseFloat(((subtotal * cart.discountPercent) / 100).toFixed(2));
  const tax = parseFloat(((subtotal * taxRate) / 100).toFixed(2));
  const serviceCharge = parseFloat(((subtotal * serviceChargeRate) / 100).toFixed(2));
  const grandTotal = Math.max(0, parseFloat((subtotal + tax + serviceCharge - discountAmount).toFixed(2)));
  const totalCartQty = cart.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

  return {
    hotel,
    activeStaff,
    selectedWaiter,
    setSelectedWaiter,
    categories,
    menuItems,
    tables,
    subtotal,
    taxRate,
    tax,
    serviceChargeRate,
    serviceCharge,
    discountAmount,
    grandTotal,
    totalCartQty,
  };
}
