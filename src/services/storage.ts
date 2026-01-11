import { Template } from '../types';

const STORAGE_KEY = 'templify_templates';
const MAX_STORAGE_SIZE = 5 * 1024 * 1024;

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], { type: mimeType });
};

interface SerializableTemplate {
  id: string;
  name: string;
  originalDocxBase64: string;
  htmlContent: string;
  schema: Template['schema'];
  createdAt: string;
}

export const saveTemplateWithBlob = async (template: Template): Promise<void> => {
  try {
    const templates = loadAllTemplates();

    const existingIndex = templates.findIndex((t) => t.id === template.id);

    const base64 = await blobToBase64(template.originalDocx);

    const serializableTemplate: SerializableTemplate = {
      id: template.id,
      name: template.name,
      originalDocxBase64: base64,
      htmlContent: template.htmlContent,
      schema: template.schema,
      createdAt: template.createdAt.toISOString(),
    };

    if (existingIndex >= 0) {
      templates[existingIndex] = serializableTemplate;
    } else {
      templates.push(serializableTemplate);
    }

    const serialized = JSON.stringify(templates);

    if (serialized.length > MAX_STORAGE_SIZE * 0.8) {
      console.warn('Storage is at 80% capacity. Consider removing old templates.');
    }

    if (serialized.length > MAX_STORAGE_SIZE) {
      throw new Error('Storage quota exceeded. Please delete some templates.');
    }

    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Error saving template:', error);
    throw error;
  }
};

export const loadTemplateWithBlob = (id: string): Template | null => {
  try {
    const templates = loadAllTemplates();
    const serializableTemplate = templates.find((t) => t.id === id);

    if (!serializableTemplate) {
      return null;
    }

    const blob = base64ToBlob(
      serializableTemplate.originalDocxBase64,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );

    const template: Template = {
      id: serializableTemplate.id,
      name: serializableTemplate.name,
      originalDocx: blob,
      htmlContent: serializableTemplate.htmlContent,
      schema: serializableTemplate.schema,
      createdAt: new Date(serializableTemplate.createdAt),
    };

    return template;
  } catch (error) {
    console.error('Error loading template:', error);
    return null;
  }
};

export const loadAllTemplates = (): SerializableTemplate[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
      return [];
    }

    return JSON.parse(data) as SerializableTemplate[];
  } catch (error) {
    console.error('Error loading templates:', error);
    return [];
  }
};

export const deleteTemplate = (id: string): void => {
  try {
    const templates = loadAllTemplates();
    const filtered = templates.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
};

export const getStorageUsage = (): {
  used: number;
  percentage: number;
} => {
  const data = localStorage.getItem(STORAGE_KEY);
  const used = data ? data.length : 0;
  const percentage = (used / MAX_STORAGE_SIZE) * 100;

  return { used, percentage };
};
