import { useState, useEffect } from 'react';
import { Template } from '../types';
import { getTemplateById } from '../services/supabase-storage';

export const useTemplateLoader = (templateId: string | undefined) => {
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const loaded = await getTemplateById(templateId);

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
  }, [templateId]);

  return { template, loading, error };
};
