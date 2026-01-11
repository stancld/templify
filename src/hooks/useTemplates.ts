import { useState, useEffect } from 'react';
import { Template } from '../types';

const STORAGE_KEY = 'templify_templates';

export const useTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Template[];
        const templatesWithDates = parsed.map((t) => ({
          ...t,
          createdAt: new Date(t.createdAt),
        }));
        setTemplates(templatesWithDates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = (template: Template) => {
    try {
      const updated = [...templates, template];
      setTemplates(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  };

  const deleteTemplate = (id: string) => {
    try {
      const updated = templates.filter(t => t.id !== id);
      setTemplates(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  };

  return {
    templates,
    loading,
    saveTemplate,
    deleteTemplate,
    refreshTemplates: loadTemplates,
  };
};
