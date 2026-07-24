import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Env variables bundled via Vite
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xbxflhzlucwhthfkjqzc.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_0goxP8V7LONJgmKIUiCONw_Mj9TkY6R';

let liveSupabaseClient: SupabaseClient | null = null;

try {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    liveSupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  }
} catch (error) {
  console.error("Failed to initialize Supabase client:", error);
}

// Runtime mode config, persists in localStorage so the user can toggle live/mock in the UI
export type DBMode = 'mock' | 'live';

const MODE_STORAGE_KEY = 'chronobody_db_mode';

export const getDBMode = (): DBMode => {
  const saved = localStorage.getItem(MODE_STORAGE_KEY);
  if (saved === 'live' || saved === 'mock') return saved;
  // Default to mock to show high-fidelity preseeded visualization immediately
  return 'mock';
};

export const setDBMode = (mode: DBMode) => {
  localStorage.setItem(MODE_STORAGE_KEY, mode);
  window.dispatchEvent(new Event('chronobody-db-mode-change'));
};

export const getSupabaseClient = (): SupabaseClient | null => {
  return getDBMode() === 'live' ? liveSupabaseClient : null;
};
