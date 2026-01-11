import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Download,
  ChevronLeft,
  ChevronRight,
  Package,
  Loader2,
} from 'lucide-react';
import { DocumentPreview } from './DocumentPreview';
import { useDocumentGenerator } from '../../hooks/useDocumentGenerator';
import { loadTemplateWithBlob } from '../../services/storage';
import { DataRow } from '../../types';

const DATA_ROWS_KEY = 'templify_data_rows';

const loadDataRows = (templateId: string): DataRow[] => {
  try {
    const data = localStorage.getItem(DATA_ROWS_KEY);
    if (!data) {return [];}
    const stored = JSON.parse(data) as Record<string, DataRow[]>;
    return stored[templateId] || [];
  } catch {
    return [];
  }
};

export const ReviewScreen: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { template, dataRows, error: loadError } = useMemo(() => {
    if (!templateId) {
      return { template: null, dataRows: [], error: 'No template ID provided' };
    }
    const loaded = loadTemplateWithBlob(templateId);
    if (!loaded) {
      return { template: null, dataRows: [], error: 'Template not found' };
    }
    const rows = loadDataRows(templateId);
    if (rows.length === 0) {
      return { template: loaded, dataRows: [], error: 'No data rows found' };
    }
    return { template: loaded, dataRows: rows, error: null };
  }, [templateId]);

  const { documents, isGenerating, progress, error: genError, generate, downloadSingle, downloadAll } =
    useDocumentGenerator();

  useEffect(() => {
    if (template && dataRows.length > 0 && documents.length === 0 && !isGenerating) {
      void generate(template, dataRows);
    }
  }, [template, dataRows, documents.length, isGenerating, generate]);

  const handleBack = () => {
    void navigate(`/data/${templateId}`);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(documents.length - 1, prev + 1));
  };

  const handleDownloadCurrent = () => {
    if (!template || !documents[currentIndex]) {return;}
    const row = dataRows[currentIndex];
    const firstFieldValue = row?.values[template.schema[0]?.id] || `document_${currentIndex + 1}`;
    const safeFilename = firstFieldValue.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 50);
    downloadSingle(documents[currentIndex], `${safeFilename}.docx`);
  };

  const handleDownloadAll = async () => {
    if (!template) {return;}
    await downloadAll(template, dataRows);
  };

  if (loadError || !template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{loadError || 'Template not found'}</p>
          <button onClick={() => void navigate('/')} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-primary-blue mx-auto mb-4" />
          <p className="text-lg font-medium text-neutral-dark">Generating documents...</p>
          <p className="text-neutral-gray mt-2">
            {progress.current} of {progress.total} documents
          </p>
          <div className="w-64 h-2 bg-neutral-light rounded-full mt-4 mx-auto overflow-hidden">
            <div
              className="h-full bg-gradient-primary rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (genError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{genError}</p>
          <button onClick={handleBack} className="btn-primary">
            Back to Data Entry
          </button>
        </div>
      </div>
    );
  }

  const currentDocument = documents[currentIndex];

  return (
    <div className="h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 flex flex-col overflow-hidden">
      <header className="bg-white border-b border-neutral-gray/20 px-6 py-4 shrink-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-neutral-light rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-neutral-dark" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-neutral-dark">Review Documents</h1>
              <p className="text-sm text-neutral-gray">
                {documents.length} document{documents.length !== 1 ? 's' : ''} generated
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadCurrent}
              disabled={!currentDocument}
              className="flex items-center gap-2 px-4 py-2 text-neutral-dark hover:bg-neutral-light rounded-lg transition-colors disabled:opacity-50"
            >
              <Download size={18} />
              <span>Download Current</span>
            </button>
            <button
              onClick={() => void handleDownloadAll()}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-primary text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Package size={18} />
              <span>Download All (.zip)</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden p-6 flex flex-col">
        <div className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-3 bg-neutral-light/50 border-b border-neutral-gray/10">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-neutral-dark hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <span className="text-sm font-medium text-neutral-dark">
              Document {currentIndex + 1} of {documents.length}
            </span>
            <button
              onClick={handleNext}
              disabled={currentIndex === documents.length - 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-neutral-dark hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-6">
            {currentDocument ? (
              <DocumentPreview docxBlob={currentDocument.docxBlob} className="h-full" />
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-gray">
                No document to preview
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-neutral-gray/20 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-neutral-dark hover:bg-neutral-light rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to Data Entry</span>
          </button>
          <button
            onClick={() => void navigate('/')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-primary text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>Done</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </footer>
    </div>
  );
};
