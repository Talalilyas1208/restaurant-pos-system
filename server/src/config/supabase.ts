import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './index.js';

let supabaseClient: SupabaseClient | null = null;
let isSupabaseDisabled = false;
let probePromise: Promise<boolean> | null = null;

export const disableSupabase = (reason?: string) => {
  if (!isSupabaseDisabled) {
    isSupabaseDisabled = true;
    supabaseClient = null;
    console.warn(`⚡ Supabase disabled (${reason || 'offline/timeout'}). Operating at ultra-fast in-memory speed (< 1ms).`);
  }
};

export const getSupabaseClient = (): SupabaseClient | null => {
  if (isSupabaseDisabled) {
    return null;
  }

  if (supabaseClient) {
    return supabaseClient;
  }

  if (config.supabaseUrl && config.supabaseKey && !config.supabaseUrl.includes('your-project')) {
    try {
      supabaseClient = createClient(config.supabaseUrl, config.supabaseKey, {
        auth: { persistSession: false },
        global: {
          fetch: (url, options = {}) => {
            // Enforce a strict 1.2s timeout so Supabase NEVER freezes API responses for 7 seconds
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
              controller.abort();
              disableSupabase('request timeout > 1.2s');
            }, 1200);

            return fetch(url, { ...options, signal: controller.signal })
              .then((res) => {
                clearTimeout(timeoutId);
                return res;
              })
              .catch((err) => {
                clearTimeout(timeoutId);
                disableSupabase(err?.message || 'network failure');
                throw err;
              });
          },
        },
      });
      console.log('✅ Supabase client initialized with 1.2s safety circuit breaker.');
      return supabaseClient;
    } catch (error) {
      disableSupabase('init exception');
      return null;
    }
  }

  return null;
};

