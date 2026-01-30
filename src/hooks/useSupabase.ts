import { useMemo } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { getStorageMode } from '../lib/storage-adapter';

export function useSupabase() {
  return useMemo(() => {
    const isConfigured = isSupabaseConfigured();
    const isLocal = getStorageMode() === 'local';

    return {
      supabase: isConfigured ? getSupabaseClient() : null,
      isConfigured,
      isLocal,
    };
  }, []);
}
