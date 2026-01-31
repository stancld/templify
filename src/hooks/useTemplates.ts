import { useState, useEffect, useCallback } from 'react';
import { Template } from '../types';
import {
  loadAllTemplates,
  deleteTemplate as deleteTemplateLocal,
  base64ToBlob,
  saveTemplateWithBlob,
} from '../services/storage';
import {
  getTemplatesForUser,
  saveTemplateToSupabase,
  deleteTemplateFromSupabase,
} from '../services/supabase-storage';
import { useAuth } from './useAuth';

export const useTemplates = () => {
  const { user, isSupabaseEnabled, isAuthenticated } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const useSupabase = isSupabaseEnabled && isAuthenticated && user;

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);

      if (useSupabase) {
        const supabaseTemplates = await getTemplatesForUser(user.id);
        setTemplates(supabaseTemplates);
      } else {
        const serializedTemplates = loadAllTemplates();
        const templatesWithBlobs = serializedTemplates.map((st) => ({
          id: st.id,
          name: st.name,
          originalDocx: base64ToBlob(
            st.originalDocxBase64,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ),
          htmlContent: st.htmlContent,
          schema: st.schema,
          createdAt: new Date(st.createdAt),
        }));
        setTemplates(templatesWithBlobs);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  }, [useSupabase, user?.id]);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  const saveTemplate = useCallback(
    async (template: Template) => {
      if (isSupabaseEnabled && isAuthenticated && user) {
        await saveTemplateToSupabase(template, user.id);
      } else {
        await saveTemplateWithBlob(template);
      }
      await loadTemplates();
    },
    [isSupabaseEnabled, isAuthenticated, user, loadTemplates]
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      try {
        if (useSupabase) {
          await deleteTemplateFromSupabase(id);
        } else {
          deleteTemplateLocal(id);
        }
        await loadTemplates();
      } catch (error) {
        console.error('Error deleting template:', error);
        throw error;
      }
    },
    [useSupabase, loadTemplates]
  );

  return {
    templates,
    loading,
    deleteTemplate,
    saveTemplate,
    refreshTemplates: loadTemplates,
  };
};
