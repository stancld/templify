import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  FileCheck,
  Download,
  Package,
} from 'lucide-react';
import { ReviewDocumentViewer } from './ReviewDocumentViewer';
import { ReviewFieldSidebar } from './ReviewFieldSidebar';
import { FieldConnector } from '../editor/FieldConnector';
import { useDocumentGenerator } from '../../hooks/useDocumentGenerator';
import { useDataSession } from '../../hooks/useDataSessions';
import { useTemplateLoader } from '../../hooks/useTemplateLoader';
import { useAuth } from '../../hooks/useAuth';
import { getDataRowsForSession } from '../../services/data-rows';
import { getDataRowsForSessionFromSupabase } from '../../services/supabase-data-rows';
import { pluralize } from '../../utils/text';
import { DataRow } from '../../types';

export const ReviewScreen: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { user, isSupabaseEnabled, isAuthenticated } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [fieldCardRect, setFieldCardRect] = useState<DOMRect | null>(null);

  const { template, loading: templateLoading, error: loadError } = useTemplateLoader(templateId);

  const [dataRows, setDataRows] = useState<DataRow[]>([]);
  const [dataRowsLoading, setDataRowsLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const useSupabase = isSupabaseEnabled && isAuthenticated && user;

  const { session, loading: sessionLoading } = useDataSession(
    templateId || '',
    template?.name || ''
  );

  useEffect(() => {
    if (!session?.id) {
      setDataRowsLoading(false);
      return;
    }

    const loadDataRows = async () => {
      try {
        setDataRowsLoading(true);
        let rows: DataRow[];

        if (useSupabase) {
          rows = await getDataRowsForSessionFromSupabase(session.id);
        } else {
          rows = getDataRowsForSession(session.id);
        }

        if (rows.length === 0) {
          setDataError('No data rows found');
        } else {
          setDataRows(rows);
        }
      } catch (error) {
        console.error('Error loading data rows:', error);
        setDataError('Failed to load data rows');
      } finally {
        setDataRowsLoading(false);
      }
    };

    void loadDataRows();
  }, [session?.id, useSupabase]);

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
    setActiveFieldId(null);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setActiveFieldId(null);
    setCurrentIndex((prev) => Math.min(documents.length - 1, prev + 1));
  };

  const handleDownloadCurrent = () => {
    if (!template || !documents[currentIndex]) {
      return;
    }
    const row = dataRows[currentIndex];
    const firstFieldValue = row?.values[template.schema[0]?.id] || `document_${currentIndex + 1}`;
    const safeFilename = firstFieldValue.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 50);
    downloadSingle(documents[currentIndex], `${safeFilename}.docx`);
  };

  const handleDownloadAll = async () => {
    if (!template) {
      return;
    }
    await downloadAll(template, dataRows);
  };

  const handleFieldClick = useCallback((fieldId: string | null) => {
    setActiveFieldId((prev) => (prev === fieldId ? null : fieldId));
  }, []);

  const handleHighlightRectChange = useCallback((rect: DOMRect | null) => {
    setHighlightRect(rect);
  }, []);

  const handleFieldCardRectChange = useCallback((rect: DOMRect | null) => {
    setFieldCardRect(rect);
  }, []);

  const isLoading = templateLoading || sessionLoading || dataRowsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (loadError || dataError || !template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{loadError || dataError || 'Template not found'}</p>
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
  const currentDataRow = dataRows[currentIndex] || null;

  return (
    <div className="h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 flex flex-col overflow-hidden">
      <header className="bg-white border-b border-neutral-gray/20 px-6 py-4 shrink-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-neutral-light rounded-lg transition-colors"
              aria-label="Back to data entry"
            >
              <ArrowLeft size={20} className="text-neutral-dark" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-neutral-dark">{session?.name || template.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <FileCheck size={14} className="text-green-500" />
                <p className="text-sm text-neutral-gray">
                  {documents.length} {pluralize(documents.length, 'document')} generated
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => void navigate('/')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-primary text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>Done</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-hidden p-6 flex flex-col">
          <div className="bg-white rounded-t-xl border border-b-0 border-neutral-gray/20 px-4 py-3 flex items-center justify-between shrink-0">
            <span className="text-sm text-neutral-gray">
              Preview of generated document
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadCurrent}
                disabled={!currentDocument}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-dark hover:bg-neutral-light rounded-lg border border-neutral-gray/20 transition-colors disabled:opacity-50"
              >
                <Download size={16} />
                <span>Download This</span>
              </button>
              <button
                onClick={() => void handleDownloadAll()}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gradient-primary text-white rounded-lg font-medium hover:shadow-md transition-all"
              >
                <Package size={16} />
                <span>Download All (.zip)</span>
              </button>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-b-xl shadow-lg overflow-hidden border border-t-0 border-neutral-gray/20">
            {currentDocument ? (
              <ReviewDocumentViewer
                docxBlob={currentDocument.docxBlob}
                fields={template.schema}
                dataRow={currentDataRow}
                activeFieldId={activeFieldId}
                onFieldClick={handleFieldClick}
                onHighlightRectChange={handleHighlightRectChange}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-gray">
                No document to preview
              </div>
            )}
          </div>
        </div>

        <ReviewFieldSidebar
          fields={template.schema}
          dataRow={currentDataRow}
          currentIndex={currentIndex}
          totalDocuments={documents.length}
          activeFieldId={activeFieldId}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onFieldClick={handleFieldClick}
          onFieldCardRectChange={handleFieldCardRectChange}
        />
      </div>

      <FieldConnector
        fieldCardRect={fieldCardRect}
        highlightRect={highlightRect}
        activeFieldId={activeFieldId}
        fields={template.schema}
      />

      <footer className="bg-white border-t border-neutral-gray/20 px-6 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-neutral-dark hover:bg-neutral-light rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to Data Entry</span>
          </button>
          <p className="text-sm text-neutral-gray">
            Click fields in the sidebar to locate them in the document
          </p>
        </div>
      </footer>
    </div>
  );
};
