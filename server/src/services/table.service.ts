import { getSupabaseClient } from '../config/supabase.js';
import { DiningTable, TableStatus } from '../types/index.js';
import { cache, TTL } from './cache.js';
import { mapTable } from './mappers.js';
import { diskStorage } from './disk-storage.service.js';
import { fallbackTables, setFallbackTables, getFallbackTables } from './table.seed.js';

export { fallbackTables, setFallbackTables, getFallbackTables };

class TableService {
  async getTables(hotelId?: string): Promise<DiningTable[]> {
    const cacheKey = `tables:${hotelId ?? 'all'}`;
    const cached = cache.get<DiningTable[]>(cacheKey);
    if (cached) return cached;

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase.from('dining_tables').select('*').order('table_number');
        if (hotelId) query = query.eq('hotel_id', hotelId);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const tables = data.map(mapTable);
          cache.set(cacheKey, tables, TTL.TABLES);
          return tables;
        }
      } catch (err: any) {
        console.warn('⚠️  getTables (Supabase):', err?.message || err);
      }
    }

    const filtered = hotelId ? fallbackTables.filter((t) => t.hotelId === hotelId) : fallbackTables;
    cache.set(cacheKey, filtered, TTL.TABLES);
    return filtered;
  }

  async getTableByTokenOrId(tokenOrId: string): Promise<DiningTable | undefined> {
    const cacheKey = `table:${tokenOrId}`;
    const cached = cache.get<DiningTable>(cacheKey);
    if (cached) return cached;

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('dining_tables')
          .select('*')
          .or(`id.eq.${tokenOrId},qr_code_token.eq.${tokenOrId},table_number.ilike.${tokenOrId}`)
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          const table = mapTable(data);
          cache.set(cacheKey, table, TTL.TABLES);
          return table;
        }
      } catch (err: any) {
        console.warn('⚠️  getTableByTokenOrId (Supabase):', err?.message || err);
      }
    }

    const match = fallbackTables.find(
      (t) =>
        t.id === tokenOrId ||
        t.qrCodeToken === tokenOrId ||
        t.tableNumber.toLowerCase() === tokenOrId.toLowerCase(),
    );
    if (match) {
      cache.set(cacheKey, match, TTL.TABLES);
    }
    return match;
  }

  async updateTableStatus(
    tableId: string,
    status: TableStatus,
    activeOrderId?: string | null,
  ): Promise<DiningTable | null> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const updatePayload: Record<string, unknown> = {
          status,
          updated_at: new Date().toISOString(),
        };
        if (activeOrderId !== undefined) {
          updatePayload['active_order_id'] = activeOrderId;
        }

        const { data, error } = await supabase
          .from('dining_tables')
          .update(updatePayload)
          .or(`id.eq.${tableId},table_number.eq.${tableId}`)
          .select()
          .maybeSingle();

        if (!error && data) {
          cache.invalidate('tables:');
          cache.invalidate(`table:${tableId}`);
          return mapTable(data);
        }
      } catch (err: any) {
        console.warn('⚠️  updateTableStatus (Supabase):', err?.message || err);
      }
    }

    const idx = fallbackTables.findIndex(
      (t) => t.id === tableId || t.tableNumber.toLowerCase() === tableId.toLowerCase(),
    );
    if (idx > -1) {
      fallbackTables[idx].status = status;
      if (activeOrderId !== undefined) fallbackTables[idx].activeOrderId = activeOrderId;
      fallbackTables[idx].updatedAt = new Date().toISOString();
      diskStorage.updateTables(fallbackTables);
      cache.invalidate('tables:');
      cache.invalidate(`table:${tableId}`);
      return fallbackTables[idx];
    }
    return null;
  }

  async addTable(table: Omit<DiningTable, 'id' | 'createdAt'>): Promise<DiningTable> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('dining_tables')
          .insert({
            hotel_id: table.hotelId,
            table_number: table.tableNumber,
            section: table.section,
            capacity: table.capacity,
            qr_code_token: table.qrCodeToken,
            status: table.status,
            active_order_id: table.activeOrderId ?? null,
          })
          .select()
          .single();

        if (!error && data) {
          cache.invalidate('tables:');
          return mapTable(data);
        }
      } catch (err: any) {
        console.warn('⚠️  addTable (Supabase):', err?.message || err);
      }
    }

    const newTbl: DiningTable = {
      id: `tbl-${Date.now()}`,
      ...table,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    fallbackTables.push(newTbl);
    diskStorage.updateTables(fallbackTables);
    cache.invalidate('tables:');
    return newTbl;
  }

  async deleteTable(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('dining_tables').delete().eq('id', id);
        if (!error) {
          cache.invalidate('tables:');
          cache.invalidate(`table:${id}`);
          return true;
        }
      } catch (err: any) {
        console.warn('⚠️  deleteTable (Supabase):', err?.message || err);
      }
    }

    const idx = fallbackTables.findIndex((t) => t.id === id);
    if (idx > -1) {
      fallbackTables.splice(idx, 1);
      diskStorage.updateTables(fallbackTables);
      cache.invalidate('tables:');
      cache.invalidate(`table:${id}`);
      return true;
    }
    return false;
  }
}

export const tableService = new TableService();

