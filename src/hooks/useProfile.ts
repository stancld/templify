import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  getProfile,
  updateProfile,
  createProfile,
  uploadAvatar,
  deleteAvatar,
} from '../services/supabase-profiles';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface UseProfileReturn {
  profile: Profile | null;
  loading: boolean;
  updateDisplayName: (name: string) => Promise<void>;
  updateAvatar: (file: File) => Promise<void>;
  removeAvatar: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useProfile(): UseProfileReturn {
  const { user, isAuthenticated, isSupabaseEnabled } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!isSupabaseEnabled || !isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      let data = await getProfile(user.id);

      // Create profile if it doesn't exist
      if (!data) {
        const metadata = user.user_metadata as Record<string, unknown> | undefined;
        const displayName = (metadata?.full_name as string | undefined) || user.email?.split('@')[0];
        data = await createProfile(user.id, displayName);
      }

      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated, isSupabaseEnabled]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const updateDisplayName = useCallback(
    async (name: string) => {
      if (!user) {
        return;
      }

      try {
        const updated = await updateProfile(user.id, { display_name: name });
        setProfile(updated);
      } catch (err) {
        console.error('Failed to update display name:', err);
        throw new Error('Failed to update display name');
      }
    },
    [user]
  );

  const updateAvatar = useCallback(
    async (file: File) => {
      if (!user) {
        return;
      }

      try {
        const avatarUrl = await uploadAvatar(user.id, file);
        const updated = await updateProfile(user.id, { avatar_url: avatarUrl });
        setProfile(updated);
      } catch (err) {
        console.error('Failed to update avatar:', err);
        throw new Error('Failed to update avatar');
      }
    },
    [user]
  );

  const removeAvatar = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      await deleteAvatar(user.id);
      const updated = await updateProfile(user.id, { avatar_url: null });
      setProfile(updated);
    } catch (err) {
      console.error('Failed to remove avatar:', err);
      throw new Error('Failed to remove avatar');
    }
  }, [user]);

  return {
    profile,
    loading,
    updateDisplayName,
    updateAvatar,
    removeAvatar,
    refresh: loadProfile,
  };
}
