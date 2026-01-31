import { useState, useEffect } from 'react';
import { Template } from '../types';
import { loadTemplateWithBlob } from '../services/storage';
import { getTemplateById } from '../services/supabase-storage';
import { useAuth } from './useAuth';

export const useTemplateLoader = (templateId: string | undefined) => {
  const { user, isSupabaseEnabled, isAuthenticated } = useAuth();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const useSupabase = isSupabaseEnabled && isAuthenticated && user;

  useEffect(() => {
    if (!templateId) {
      setError('No template ID provided');
      setLoading(false);
      return;
    }

    const loadTemplate = async () => {
      try {
        setLoading(true);
        setError(null);

        let loaded: Template | null;

        if (useSupabase) {
          loaded = await getTemplateById(templateId);
        } else {
          loaded = loadTemplateWithBlob(templateId);
        }

        if (!loaded) {
          setError('Template not found');
        } else {
          setTemplate(loaded);
        }
      } catch (err) {
        console.error('Error loading template:', err);
        setError('Failed to load template');
      } finally {
        setLoading(false);
      }
    };

    void loadTemplate();
  }, [templateId, useSupabase]);

  return { template, loading, error };
};
