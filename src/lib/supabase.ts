/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl: string =
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://qazflguhczceidcxwtlx.supabase.co';
const supabaseAnonKey: string =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_WXRwj82HAw91ZJDfiA4TYw_uKyn-ELL';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
