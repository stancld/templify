import { useState, useCallback, useEffect } from 'react';
import { DataSession } from '../types';
import {
  getOrCreateSessionInSupabase,
  updateSessionNameInSupabase,
} from '../services/supabase-data-sessions';
import { useAuth } from './useAuth';

export const useDataSession = (templateId: string, templateName: string) => {
  const { user } = useAuth();
  const [session, setSession] = useState<DataSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!templateId || !templateName) {
      setLoading(false);
      return;
    }

    const loadSession = async () => {
      setLoading(true);
      try {
        if (!user) {
          return;
        }

        const supabaseSession = await getOrCreateSessionInSupabase(
          templateId,
          templateName,
          user.id
        );
        setSession(supabaseSession);
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadSession();
  }, [templateId, templateName, user]);

  const updateSessionName = useCallback(
    async (name: string) => {
      if (!session) {
        return null;
      }

      try {
        const updated = await updateSessionNameInSupabase(session.id, name);
        if (updated) {
          setSession(updated);
        }
        return updated;
      } catch (error) {
        console.error('Error updating session name:', error);
        return null;
      }
    },
    [session]
  );

  return {
    session,
    loading,
    updateSessionName,
  };
};
