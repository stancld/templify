import { useState, useEffect, useCallback } from 'react';
import { Template } from '../types';
import {
  getTemplates,
  saveTemplateToSupabase,
  deleteTemplateFromSupabase,
} from '../services/supabase-storage';
import { useAuth } from './useAuth';

export const useTemplates = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const supabaseTemplates = await getTemplates();
      setTemplates(supabaseTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  const saveTemplate = useCallback(
    async (template: Template) => {
      if (!user) {
        throw new Error('User is required to save templates');
      }

      await saveTemplateToSupabase(template, user.id);
      await loadTemplates();
    },
    [user, loadTemplates]
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      try {
        await deleteTemplateFromSupabase(id, user?.id);
        await loadTemplates();
      } catch (error) {
        console.error('Error deleting template:', error);
        throw error;
      }
    },
    [user?.id, loadTemplates]
  );

  return {
    templates,
    loading,
    deleteTemplate,
    saveTemplate,
    refreshTemplates: loadTemplates,
  };
};
