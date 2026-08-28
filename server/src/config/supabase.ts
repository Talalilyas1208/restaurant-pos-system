import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './index.js';

let supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (config.supabaseUrl && config.supabaseKey && !config.supabaseUrl.includes('your-project')) {
    try {
      supabaseClient = createClient(config.supabaseUrl, config.supabaseKey);
      console.log('✅ Supabase client initialized successfully.');
      return supabaseClient;
    } catch (error) {
      console.warn('⚠️ Failed to initialize Supabase client. Falling back to local data store.', error);
      return null;
    }
  }

  return null;
};
