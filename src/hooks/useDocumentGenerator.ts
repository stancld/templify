import { useState, useCallback } from 'react';
import { Template, DataRow, GeneratedDocument } from '../types';
import {
  generateAllDocuments,
  downloadDocument,
  downloadAllAsZip,
} from '../services/docx-generator';

interface UseDocumentGeneratorReturn {
  documents: GeneratedDocument[];
  isGenerating: boolean;
  progress: { current: number; total: number };
  error: string | null;
  generate: (template: Template, dataRows: DataRow[]) => Promise<void>;
  downloadSingle: (doc: GeneratedDocument, filename: string) => void;
  downloadAll: (template: Template, dataRows: DataRow[]) => Promise<void>;
  reset: () => void;
}

export const useDocumentGenerator = (): UseDocumentGeneratorReturn => {
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (template: Template, dataRows: DataRow[]) => {
    setIsGenerating(true);
    setError(null);
    setProgress({ current: 0, total: dataRows.length });

    try {
      const generatedDocs = await generateAllDocuments(template, dataRows, (current, total) => {
        setProgress({ current, total });
      });
      setDocuments(generatedDocs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate documents');
      setDocuments([]);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const downloadSingle = useCallback((doc: GeneratedDocument, filename: string) => {
    downloadDocument(doc, filename);
  }, []);

  const downloadAll = useCallback(
    async (template: Template, dataRows: DataRow[]) => {
      try {
        await downloadAllAsZip(documents, template, dataRows);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to download documents');
      }
    },
    [documents]
  );

  const reset = useCallback(() => {
    setDocuments([]);
    setProgress({ current: 0, total: 0 });
    setError(null);
  }, []);

  return {
    documents,
    isGenerating,
    progress,
    error,
    generate,
    downloadSingle,
    downloadAll,
    reset,
  };
};
