import { getSupabaseClient } from '../config/supabase.js';
import { Category } from '../types/index.js';
import { cache, TTL } from './cache.js';
import { mapCategory } from './mappers.js';
import { fallbackCategories } from './menu.seed.js';

class CategoryService {
  async getCategories(hotelId?: string): Promise<Category[]> {
    const cacheKey = `categories:${hotelId ?? 'all'}`;
    const cached = cache.get<Category[]>(cacheKey);
    if (cached) return cached;

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase.from('categories').select('*').order('sort_order');
        if (hotelId) query = query.eq('hotel_id', hotelId);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const categories = data.map(mapCategory);
          cache.set(cacheKey, categories, TTL.CATEGORIES);
          return categories;
        }
      } catch (err: any) {
        console.warn('⚠️  getCategories (Supabase):', err?.message || err);
      }
    }

    const filtered = hotelId ? fallbackCategories.filter((c) => c.hotelId === hotelId) : fallbackCategories;
    cache.set(cacheKey, filtered, TTL.CATEGORIES);
    return filtered;
  }

  async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .insert({
            hotel_id: category.hotelId,
            name: category.name,
            description: category.description ?? null,
            icon: category.icon ?? null,
            image_url: category.imageUrl ?? null,
            sort_order: category.sortOrder,
            is_active: category.isActive,
          })
          .select()
          .single();

        if (!error && data) {
          cache.invalidate('categories:');
          return mapCategory(data);
        }
      } catch (err: any) {
        console.warn('⚠️  addCategory (Supabase):', err?.message || err);
      }
    }

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      ...category,
    };
    fallbackCategories.push(newCat);
    cache.invalidate('categories:');
    return newCat;
  }
}

export const categoryService = new CategoryService();
