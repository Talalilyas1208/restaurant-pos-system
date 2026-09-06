'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { api } from '../lib/api';
import { Hotel } from '../types';

export function useAdminMutations() {
  const queryClient = useQueryClient();

  const updateHotelMutation = useMutation({
    mutationFn: (values: Partial<Hotel>) => api.updateHotel(values),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['hotel'] });
      message.success(`Restaurant settings updated for ${updated.name}!`);
    },
  });

  const createTableMutation = useMutation({
    mutationFn: (newTbl: any) => api.createTable(newTbl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      message.success('New table created with dynamic QR code!');
    },
  });

  const deleteTableMutation = useMutation({
    mutationFn: (id: string) => api.deleteTable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      message.success('Table deleted successfully!');
    },
  });

  const createMenuItemMutation = useMutation({
    mutationFn: (newItem: any) => api.createMenuItem(newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      message.success('New dish added to menu catalog!');
    },
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: (id: string) => api.deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      message.success('Dish removed from menu catalog!');
    },
  });

  const toggleItemStockMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      api.updateMenuItem(id, { isAvailable }),
    onSuccess: (_, variables) => {
      message.info(variables.isAvailable ? 'Dish marked back in stock.' : 'Dish marked 86 / Sold Out.');
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
  });

  const createStaffMutation = useMutation({
    mutationFn: (staff: any) => api.createStaff(staff),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      message.success('New staff member added!');
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: (id: string) => api.deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      message.success('Staff member removed!');
    },
  });

  return {
    updateHotelMutation,
    createTableMutation,
    deleteTableMutation,
    createMenuItemMutation,
    deleteMenuItemMutation,
    toggleItemStockMutation,
    createStaffMutation,
    deleteStaffMutation,
  };
}
