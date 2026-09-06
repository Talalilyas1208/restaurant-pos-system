import bcrypt from 'bcryptjs';
import { getSupabaseClient } from '../config/supabase.js';
import { StaffUser } from '../types/index.js';
import { cache, TTL } from './cache.js';
import { mapStaffUser } from './mappers.js';

export let fallbackStaff: StaffUser[] = [
  { id: 'W-101', hotelId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Marco Rossi', role: 'waiter', pinCode: '$2b$10$sOSfaM7sfFxaDua5UeVhhup/VP1BsDNif8NZW136kR/fi58hqIo4S', isActive: true },
  { id: 'W-102', hotelId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Sophia Chen', role: 'waiter', pinCode: '$2b$10$ahjZGISmZ5JSFl93r.9CZ.QY0.m0eNOQ2zvc.ceiKqUnnI7lswOZC', isActive: true },
  { id: 'W-103', hotelId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'David Miller', role: 'waiter', pinCode: '$2b$10$D.x.1ZZi4bd.4dlHrvvqlecjaK8/kcknZgWzviMndo1ElONTpbSiK', isActive: true },
  { id: 'W-104', hotelId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Emma Watson', role: 'waiter', pinCode: '$2b$10$nQYE78uVaVRS3rEWvl9YA.fkJs6dgt/Y317rQdJuQhRev8XB6hPGK', isActive: true },
];

class StaffService {
  async getStaffUsers(hotelId?: string): Promise<StaffUser[]> {
    const cacheKey = `staff:${hotelId ?? 'all'}`;
    const cached = cache.get<StaffUser[]>(cacheKey);
    if (cached) return cached;

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase.from('staff_users').select('*').order('name');
        if (hotelId) query = query.eq('hotel_id', hotelId);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const staff = data.map(mapStaffUser);
          cache.set(cacheKey, staff, TTL.TABLES);
          return staff;
        }
      } catch (err: any) {
        console.warn('⚠️  getStaffUsers (Supabase):', err?.message || err);
      }
    }

    const filtered = hotelId ? fallbackStaff.filter((s) => s.hotelId === hotelId) : fallbackStaff;
    cache.set(cacheKey, filtered, TTL.TABLES);
    return filtered;
  }

  async addStaffUser(staff: Omit<StaffUser, 'id' | 'createdAt'>): Promise<StaffUser> {
    const hashedPin = staff.pinCode?.startsWith('$2b$')
      ? staff.pinCode
      : await bcrypt.hash(staff.pinCode || '1234', 10);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('staff_users')
          .insert({
            hotel_id: staff.hotelId,
            name: staff.name,
            email: staff.email ?? null,
            role: staff.role,
            pin_code: hashedPin,
            is_active: staff.isActive,
          })
          .select()
          .single();

        if (!error && data) {
          cache.invalidate('staff:');
          return mapStaffUser(data);
        }
      } catch (err: any) {
        console.warn('⚠️  addStaffUser (Supabase):', err?.message || err);
      }
    }

    const newStaff: StaffUser = {
      id: `W-${100 + fallbackStaff.length + 1}`,
      ...staff,
      pinCode: hashedPin,
      createdAt: new Date().toISOString(),
    };
    fallbackStaff.push(newStaff);
    cache.invalidate('staff:');
    return newStaff;
  }

  async deleteStaffUser(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('staff_users').delete().eq('id', id);
        if (!error) {
          cache.invalidate('staff:');
          return true;
        }
      } catch (err: any) {
        console.warn('⚠️  deleteStaffUser (Supabase):', err?.message || err);
      }
    }

    const idx = fallbackStaff.findIndex((s) => s.id === id);
    if (idx > -1) {
      fallbackStaff.splice(idx, 1);
      cache.invalidate('staff:');
      return true;
    }
    return false;
  }
}

export const staffService = new StaffService();
