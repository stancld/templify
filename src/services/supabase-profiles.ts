import { getSupabaseClient } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabaseClient();

  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  const { data, error } = await (supabase.from('profiles') as any)
    .select('*')
    .eq('id', userId)
    .single();
  /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

  if (error) {
    // PGRST116 = row not found, which is expected for new users
    const errCode = (error as { code?: string }).code;
    if (errCode === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data as Profile;
}

export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
  const supabase = getSupabaseClient();

  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  const { data, error } = await (supabase.from('profiles') as any)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();
  /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

  if (error) {
    throw error;
  }

  return data as Profile;
}

export async function createProfile(userId: string, displayName?: string): Promise<Profile> {
  const supabase = getSupabaseClient();

  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  const { data, error } = await (supabase.from('profiles') as any)
    .insert({
      id: userId,
      display_name: displayName || null,
    })
    .select()
    .single();
  /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

  if (error) {
    throw error;
  }

  return data as Profile;
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const supabase = getSupabaseClient();

  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);

  // Add cache-busting query param
  return `${data.publicUrl}?t=${Date.now()}`;
}

export async function deleteAvatar(userId: string): Promise<void> {
  const supabase = getSupabaseClient();

  // List all files in user's avatar folder
  const { data: files } = await supabase.storage
    .from('avatars')
    .list(userId);

  if (files && files.length > 0) {
    const filesToRemove = files.map((f) => `${userId}/${f.name}`);
    await supabase.storage.from('avatars').remove(filesToRemove);
  }
}
