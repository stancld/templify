import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Trash2, FileText, ArrowRight } from 'lucide-react';
import { SpreadsheetGrid } from './SpreadsheetGrid';
import { ImportDialog } from './ImportDialog';
import { useDataRows } from '../../hooks/useDataRows';
import { loadTemplateWithBlob } from '../../services/storage';
import { pluralize } from '../../utils/text';

export const DataEntryScreen: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();

  const { template, error } = useMemo(() => {
    if (!templateId) {
      return { template: null, error: 'No template ID provided' };
    }
    const loaded = loadTemplateWithBlob(templateId);
    if (!loaded) {
      return { template: null, error: 'Template not found' };
    }
    return { template: loaded, error: null };
  }, [templateId]);

  const [isImportOpen, setIsImportOpen] = useState(false);

  const { rows, addRow, updateRow, deleteRow, deleteAllRows, importRows } = useDataRows(
    templateId || '',
    template?.schema || []
  );

  const handleBack = () => {
    void navigate(`/editor/${templateId}`);
  };

  const handleClearAll = () => {
    if (rows.length === 0) {
      return;
    }
    if (window.confirm(`Are you sure you want to delete all ${rows.length} rows?`)) {
      deleteAllRows();
    }
  };

  const handleGenerateDocuments = () => {
    if (rows.length === 0) {
      alert('Please add some data rows first');
      return;
    }
    void navigate(`/review/${templateId}`);
  };

  if (error || !template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Template not found'}</p>
          <button onClick={() => void navigate('/')} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-neutral-dark">{template.name}</h1>
              <p className="text-sm text-neutral-gray">
                Enter data for {template.schema.length} {pluralize(template.schema.length, 'field')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-neutral-dark hover:bg-neutral-light rounded-lg transition-colors"
            >
              <Upload size={18} />
              <span>Import CSV</span>
            </button>
            {rows.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={handleGenerateDocuments}
              disabled={rows.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-primary text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              <FileText size={18} />
              <span>Generate Documents</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full bg-white rounded-xl shadow-lg p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-dark">Data Entries</h2>
              <p className="text-sm text-neutral-gray">
                {rows.length} {pluralize(rows.length, 'row')} •{' '}
                {rows.length === 0
                  ? 'Add data manually or import from CSV'
                  : 'Click cells to edit, use Tab/Enter to navigate'}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <SpreadsheetGrid
              fields={template.schema}
              rows={rows}
              onAddRow={addRow}
              onUpdateCell={updateRow}
              onDeleteRow={deleteRow}
            />
          </div>
        </div>
      </div>

      <ImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={importRows}
        fields={template.schema}
      />
    </div>
  );
};
