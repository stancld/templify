import { useState, useEffect } from 'react';
import { DataSession } from '../types';
import { getOrCreateSessionInSupabase } from '../services/supabase-data-sessions';
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

  return {
    session,
    loading,
  };
};
