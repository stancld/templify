import { useState, useEffect } from 'react';
import { Template, Field } from '../types';
import { loadTemplateWithBlob, saveTemplateWithBlob } from '../services/storage';
import { extractPlainText } from '../services/docx-parser';

export const useTemplateEditor = (templateId: string) => {
  const [template, setTemplate] = useState<Template | null>(null);
  const [plainText, setPlainText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  const loadTemplate = () => {
    try {
      setLoading(true);
      setError(null);

      const loaded = loadTemplateWithBlob(templateId);

      if (!loaded) {
        setError('Template not found');
        setLoading(false);
        return;
      }

      setTemplate(loaded);

      const text = extractPlainText(loaded.htmlContent);
      setPlainText(text);

      setLoading(false);
    } catch (err) {
      console.error('Error loading template:', err);
      setError('Failed to load template');
      setLoading(false);
    }
  };

  const saveTemplate = async (updatedTemplate: Template) => {
    try {
      await saveTemplateWithBlob(updatedTemplate);
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
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

  return {
    template,
    plainText,
    loading,
    error,
    addField,
    updateField,
    deleteField,
    refreshTemplate: loadTemplate,
  };
};
