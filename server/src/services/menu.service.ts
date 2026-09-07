import { getSupabaseClient } from '../config/supabase.js';
import { Category, MenuItem } from '../types/index.js';
import { cache, TTL } from './cache.js';
import { mapMenuItem } from './mappers.js';
import { fallbackMenuItems } from './menu.seed.js';
import { categoryService } from './category.service.js';

class MenuService {
  async getCategories(hotelId?: string): Promise<Category[]> {
    return categoryService.getCategories(hotelId);
  }

  async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    return categoryService.addCategory(category);
  }

  async getMenuItems(hotelId?: string, categoryId?: string): Promise<MenuItem[]> {
    const cacheKey = `menu:${hotelId ?? 'all'}:${categoryId ?? 'all'}`;
    const cached = cache.get<MenuItem[]>(cacheKey);
    if (cached) return cached;

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase.from('menu_items').select('*, item_modifiers(*)').order('name');
        if (hotelId) query = query.eq('hotel_id', hotelId);
        if (categoryId) query = query.eq('category_id', categoryId);

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const items = data.map(mapMenuItem);
          cache.set(cacheKey, items, TTL.MENU);
          return items;
        }
      } catch (err: any) {
        console.warn('⚠️  getMenuItems (Supabase):', err?.message || err);
      }
    }

    let items = fallbackMenuItems;
    if (hotelId) items = items.filter((i) => i.hotelId === hotelId);
    if (categoryId && categoryId !== 'all') items = items.filter((i) => i.categoryId === categoryId);

    cache.set(cacheKey, items, TTL.MENU);
    return items;
  }

  async getMenuItemById(id: string): Promise<MenuItem | undefined> {
    const cacheKey = `menuitem:${id}`;
    const cached = cache.get<MenuItem>(cacheKey);
    if (cached) return cached;

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*, item_modifiers(*)')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          const item = mapMenuItem(data);
          cache.set(cacheKey, item, TTL.MENU);
          return item;
        }
      } catch (err: any) {
        console.warn('⚠️  getMenuItemById (Supabase):', err?.message || err);
      }
    }

    const item = fallbackMenuItems.find((i) => i.id === id);
    if (item) cache.set(cacheKey, item, TTL.MENU);
    return item;
  }

  async addMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .insert({
            hotel_id: item.hotelId,
            category_id: item.categoryId,
            name: item.name,
            description: item.description ?? null,
            price: item.price,
            cost_price: item.costPrice ?? 0,
            image_url: item.imageUrl ?? null,
            is_available: item.isAvailable,
            is_veg: item.isVeg,
            is_vegan: item.isVegan,
            is_gluten_free: item.isGlutenFree,
            is_spicy: item.isSpicy,
            is_chef_special: item.isChefSpecial,
            preparation_time: item.preparationTime,
            calories: item.calories ?? null,
            allergens: item.allergens ?? [],
          })
          .select('*, item_modifiers(*)')
          .single();

        if (!error && data) {
          cache.invalidate('menu:');
          return mapMenuItem(data);
        }
      } catch (err: any) {
        console.warn('⚠️  addMenuItem (Supabase):', err?.message || err);
      }
    }

    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      ...item,
    };
    fallbackMenuItems.push(newItem);
    cache.invalidate('menu:');
    return newItem;
  }

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const updatePayload: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };
        if (updates.name !== undefined)            updatePayload['name'] = updates.name;
        if (updates.description !== undefined)     updatePayload['description'] = updates.description;
        if (updates.price !== undefined)           updatePayload['price'] = updates.price;
        if (updates.costPrice !== undefined)       updatePayload['cost_price'] = updates.costPrice;
        if (updates.imageUrl !== undefined)        updatePayload['image_url'] = updates.imageUrl;
        if (updates.isAvailable !== undefined)     updatePayload['is_available'] = updates.isAvailable;
        if (updates.isVeg !== undefined)           updatePayload['is_veg'] = updates.isVeg;
        if (updates.isVegan !== undefined)         updatePayload['is_vegan'] = updates.isVegan;
        if (updates.isGlutenFree !== undefined)    updatePayload['is_gluten_free'] = updates.isGlutenFree;
        if (updates.isSpicy !== undefined)         updatePayload['is_spicy'] = updates.isSpicy;
        if (updates.isChefSpecial !== undefined)   updatePayload['is_chef_special'] = updates.isChefSpecial;
        if (updates.preparationTime !== undefined) updatePayload['preparation_time'] = updates.preparationTime;
        if (updates.calories !== undefined)        updatePayload['calories'] = updates.calories;
        if (updates.allergens !== undefined)       updatePayload['allergens'] = updates.allergens;
        if (updates.categoryId !== undefined)      updatePayload['category_id'] = updates.categoryId;

        const { data, error } = await supabase
          .from('menu_items')
          .update(updatePayload)
          .eq('id', id)
          .select('*, item_modifiers(*)')
          .maybeSingle();

        if (!error && data) {
          cache.invalidate('menu:');
          cache.invalidate(`menuitem:${id}`);
          return mapMenuItem(data);
        }
      } catch (err: any) {
        console.warn('⚠️  updateMenuItem (Supabase):', err?.message || err);
      }
    }

    const idx = fallbackMenuItems.findIndex((i) => i.id === id);
    if (idx > -1) {
      fallbackMenuItems[idx] = { ...fallbackMenuItems[idx], ...updates };
      cache.invalidate('menu:');
      cache.invalidate(`menuitem:${id}`);
      return fallbackMenuItems[idx];
    }
    return null;
  }

  async deleteMenuItem(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('menu_items').delete().eq('id', id);
        if (!error) {
          cache.invalidate('menu:');
          cache.invalidate(`menuitem:${id}`);
          return true;
        }
      } catch (err: any) {
        console.warn('⚠️  deleteMenuItem (Supabase):', err?.message || err);
      }
    }

    const idx = fallbackMenuItems.findIndex((i) => i.id === id);
    if (idx > -1) {
      fallbackMenuItems.splice(idx, 1);
      cache.invalidate('menu:');
      cache.invalidate(`menuitem:${id}`);
      return true;
    }
    return false;
  }
}

export const menuService = new MenuService();

