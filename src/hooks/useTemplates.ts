import { useState, useEffect } from 'react';
import { Template } from '../types';
import { loadAllTemplates, deleteTemplate as deleteTemplateStorage, base64ToBlob } from '../services/storage';

export const useTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    try {
      setLoading(true);
      const serializedTemplates = loadAllTemplates();

      const templatesWithBlobs = serializedTemplates.map((st) => {
        const blob = base64ToBlob(
          st.originalDocxBase64,
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );

        const template: Template = {
          id: st.id,
          name: st.name,
          originalDocx: blob,
          htmlContent: st.htmlContent,
          schema: st.schema,
          createdAt: new Date(st.createdAt),
        };

        return template;
      });

      setTemplates(templatesWithBlobs);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = (id: string) => {
    try {
      deleteTemplateStorage(id);
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  };

  return {
    templates,
    loading,
    deleteTemplate,
    refreshTemplates: loadTemplates,
  };
};
