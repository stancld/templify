import { useState, useEffect, useCallback } from 'react';
import { Template, Field } from '../types';
import { getTemplateById, saveTemplateToSupabase } from '../services/supabase-storage';
import { generateId } from '../utils/id';
import { useAuth } from './useAuth';

export const useTemplateEditor = (templateId: string) => {
  const { user } = useAuth();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setLoading(true);
        setError(null);

        const loaded = await getTemplateById(templateId);

        if (!loaded) {
          setError('Template not found');
          setLoading(false);
          return;
        }

        setTemplate(loaded);
        setLoading(false);
      } catch (err) {
        console.error('Error loading template:', err);
        setError('Failed to load template');
        setLoading(false);
      }
    };

    void loadTemplate();
  }, [templateId]);

  const handlePlainTextExtracted = useCallback((_text: string) => {}, []);

  const saveTemplate = async (updatedTemplate: Template) => {
    try {
      if (!user) {
        throw new Error('User is required to save templates');
      }

      await saveTemplateToSupabase(updatedTemplate, user.id);
      setTemplate(updatedTemplate);
    } catch (err) {
      console.error('Error saving template:', err);
      setError('Failed to save template');
      throw err;
    }
  };

  const addField = async (fieldData: Omit<Field, 'id'>) => {
    if (!template) {
      return;
    }

    const newField: Field = {
      ...fieldData,
      id: generateId(),
    };

    const updatedTemplate = {
      ...template,
      schema: [...template.schema, newField],
    };

    await saveTemplate(updatedTemplate);
  };

  const updateField = async (fieldId: string, updates: Partial<Omit<Field, 'id'>>) => {
    if (!template) {
      return;
    }

    const updatedSchema = template.schema.map((f) =>
      f.id === fieldId ? { ...f, ...updates } : f
    );

    const updatedTemplate = {
      ...template,
      schema: updatedSchema,
    };

    await saveTemplate(updatedTemplate);
  };

  const deleteField = async (fieldId: string) => {
    if (!template) {
      return;
    }

    const updatedTemplate = {
      ...template,
      schema: template.schema.filter((f) => f.id !== fieldId),
    };

    await saveTemplate(updatedTemplate);
  };

  const updateTemplateName = async (name: string) => {
    if (!template) {
      return;
    }

    const updatedTemplate = {
      ...template,
      name,
    };

    await saveTemplate(updatedTemplate);
  };

  return {
    template,
    loading,
    error,
    addField,
    updateField,
    deleteField,
    updateTemplateName,
    handlePlainTextExtracted,
  };
};
