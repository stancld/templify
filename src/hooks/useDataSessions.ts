import { useState, useCallback, useEffect } from 'react';
import { DataSession } from '../types';
import {
  getOrCreateSession,
  updateSessionName as updateSessionNameLocal,
} from '../services/data-sessions';
import {
  getOrCreateSessionInSupabase,
  updateSessionNameInSupabase,
} from '../services/supabase-data-sessions';
import { useAuth } from './useAuth';

export const useDataSession = (templateId: string, templateName: string) => {
  const { user, isSupabaseEnabled, isAuthenticated } = useAuth();
  const [session, setSession] = useState<DataSession | null>(null);
  const [loading, setLoading] = useState(true);

  const useSupabase = isSupabaseEnabled && isAuthenticated && user;

  useEffect(() => {
    if (!templateId || !templateName) {
      setLoading(false);
      return;
    }

    const loadSession = async () => {
      setLoading(true);
      try {
        if (useSupabase) {
          const supabaseSession = await getOrCreateSessionInSupabase(
            templateId,
            templateName,
            user.id
          );
          setSession(supabaseSession);
        } else {
          const localSession = getOrCreateSession(templateId, templateName);
          setSession(localSession);
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadSession();
  }, [templateId, templateName, useSupabase, user?.id]);

  const updateSessionName = useCallback(
    async (name: string) => {
      if (!session) {
        return null;
      }

      try {
        let updated: DataSession | null;
        if (useSupabase) {
          updated = await updateSessionNameInSupabase(session.id, name);
        } else {
          updated = updateSessionNameLocal(session.templateId, name);
        }
        if (updated) {
          setSession(updated);
        }
        return updated;
      } catch (error) {
        console.error('Error updating session name:', error);
        return null;
      }
    },
    [session, useSupabase]
  );

  return {
    session,
    loading,
    updateSessionName,
  };
};
