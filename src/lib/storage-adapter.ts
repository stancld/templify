export type StorageMode = 'local' | 'supabase';

export function getStorageMode(): StorageMode {
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
  const hasSupabaseConfig =
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

  return useSupabase && hasSupabaseConfig ? 'supabase' : 'local';
}

export interface StorageAdapter<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(item: Omit<T, 'id'>): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
