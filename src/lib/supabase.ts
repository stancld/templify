import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

let supabaseInstance: SupabaseClient<Database> | null = null;

export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && key);
}

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
    );
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }

  return supabaseInstance;
}
