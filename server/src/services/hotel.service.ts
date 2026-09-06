import { getSupabaseClient } from '../config/supabase.js';
import { Hotel } from '../types/index.js';
import { cache, TTL } from './cache.js';
import { mapHotel } from './mappers.js';

// ─── Fallback seed data ───────────────────────────────────────────────────────
let fallbackHotel: Hotel = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  name: 'POS Project Bistro',
  slug: 'pos-project',
  tagline: 'Modern Restaurant & Digital QR Dining',
  logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=80',
  currency: 'USD',
  currencySymbol: '$',
  taxRate: 8.5,
  serviceChargeRate: 5.0,
  address: '742 Restaurant Ave, Suite 100',
  phone: '+1 (555) 234-5678',
  email: 'dining@posproject.com',
  createdAt: new Date().toISOString(),
};

// ─── HotelService ─────────────────────────────────────────────────────────────
class HotelService {
  async getHotel(slugOrId?: string): Promise<Hotel> {
    const cacheKey = `hotel:${slugOrId ?? '__default__'}`;
    const cached = cache.get<Hotel>(cacheKey);
    if (cached) return cached;

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const query = supabase.from('hotels').select('*');
        if (slugOrId) {
          query.or(`id.eq.${slugOrId},slug.eq.${slugOrId}`);
        }
        const { data, error } = await query.single();
        if (!error && data) {
          const hotel = mapHotel(data);
          cache.set(cacheKey, hotel, TTL.HOTEL);
          return hotel;
        }
      } catch (err: any) {
        console.warn('⚠️  getHotel (Supabase):', err?.message || err);
      }
    }

    cache.set(cacheKey, fallbackHotel, TTL.HOTEL);
    return fallbackHotel;
  }

  async updateHotel(updates: Partial<Hotel>): Promise<Hotel> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const hotel = await this.getHotel();
        const { data, error } = await supabase
          .from('hotels')
          .update({
            name: updates.name,
            slug: updates.slug,
            tagline: updates.tagline,
            logo_url: updates.logoUrl,
            currency: updates.currency,
            currency_symbol: updates.currencySymbol,
            tax_rate: updates.taxRate,
            service_charge_rate: updates.serviceChargeRate,
            address: updates.address,
            phone: updates.phone,
            email: updates.email,
            updated_at: new Date().toISOString(),
          })
          .eq('id', hotel.id)
          .select()
          .single();

        if (!error && data) {
          cache.invalidate('hotel:');
          return mapHotel(data);
        }
      } catch (err: any) {
        console.warn('⚠️  updateHotel (Supabase):', err?.message || err);
      }
    }

    fallbackHotel = { ...fallbackHotel, ...updates, updatedAt: new Date().toISOString() };
    cache.invalidate('hotel:');
    return fallbackHotel;
  }
}

export const hotelService = new HotelService();
