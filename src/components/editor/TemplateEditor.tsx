import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ArrowRight, Table } from 'lucide-react';
import { useTemplateEditor } from '../../hooks/useTemplateEditor';
import { DocumentViewer, TextSelection } from './DocumentViewer';
import { FieldSidebar } from './FieldSidebar';
import { FieldDefinitionModal } from './FieldDefinitionModal';
import { FieldConnector } from './FieldConnector';
import { Field } from '../../types';
import { pluralize } from '../../utils/text';

export const TemplateEditor: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();

  const {
    template,
    loading,
    error,
    addField,
    updateField,
    deleteField,
    handlePlainTextExtracted,
  } = useTemplateEditor(templateId || '');

  const [selectedText, setSelectedText] = useState<TextSelection | null>(null);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);

  const mainContentRef = useRef<HTMLDivElement>(null);
  const documentViewerRef = useRef<HTMLDivElement>(null);
  const [connectorPoints, setConnectorPoints] = useState<{
    fieldCardRect: DOMRect | null;
    highlightRect: DOMRect | null;
  }>({ fieldCardRect: null, highlightRect: null });

  useEffect(() => {
    const computeConnectorPoints = () => {
      if (!activeFieldId) {
        return { fieldCardRect: null, highlightRect: null };
      }

      const fieldCard = document.querySelector(`[data-field-card-id="${activeFieldId}"]`);
      const highlight = document.querySelector(`[data-field-id="${activeFieldId}"]`);

      if (fieldCard && highlight) {
        return {
          fieldCardRect: fieldCard.getBoundingClientRect(),
          highlightRect: highlight.getBoundingClientRect(),
        };
      }
      return { fieldCardRect: null, highlightRect: null };
    };

    const updatePoints = () => {
      const points = computeConnectorPoints();
      setConnectorPoints(points);
    };

    const frameId = requestAnimationFrame(updatePoints);

    const handleScroll = () => {
      requestAnimationFrame(updatePoints);
    };

    const mainContent = mainContentRef.current;
    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll);
    }
    window.addEventListener('resize', updatePoints);

    return () => {
      cancelAnimationFrame(frameId);
      if (mainContent) {
        mainContent.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('resize', updatePoints);
    };
  }, [activeFieldId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!activeFieldId) {return;}
      
      const target = e.target as HTMLElement;
      const isInsideDocument = documentViewerRef.current?.contains(target);
      const isInsideSidebar = target.closest('[data-field-card-id]');
      
      if (!isInsideDocument && !isInsideSidebar) {
        setActiveFieldId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeFieldId]);

  const handleTextSelected = (selection: TextSelection) => {
    setSelectedText(selection);
    setEditingField(null);
    setIsModalOpen(true);
  };

  const handleFieldSave = (fieldData: Omit<Field, 'id'>) => {
    void (async () => {
      try {
        if (editingField) {
          await updateField(editingField.id, {
            name: fieldData.name,
            type: fieldData.type,
          });
        } else {
          await addField(fieldData);
        }
        setIsModalOpen(false);
        setSelectedText(null);
        setEditingField(null);
      } catch (err) {
        console.error('Error saving field:', err);
      }
    })();
  };

  const handleFieldClick = (fieldId: string) => {
    setActiveFieldId(fieldId === activeFieldId ? null : fieldId);
  };

  const handleFieldEdit = (fieldId: string) => {
    const field = template?.schema.find((f) => f.id === fieldId);
    if (field) {
      setEditingField(field);
      setIsModalOpen(true);
    }
  };

  const handleFieldDelete = (fieldId: string) => {
    if (window.confirm('Are you sure you want to delete this field?')) {
      void (async () => {
        try {
          await deleteField(fieldId);
          if (activeFieldId === fieldId) {
            setActiveFieldId(null);
          }
        } catch (err) {
          console.error('Error deleting field:', err);
        }
      })();
    }
  };

  const handleBack = () => {
    void navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4" />
          <p className="text-neutral-gray">Loading template...</p>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Template not found'}</p>
          <button onClick={handleBack} className="btn-primary">
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
              <h1 className="text-2xl font-bold text-neutral-dark">
                {template.name}
              </h1>
              <p className="text-sm text-neutral-gray">
                {template.schema.length} {pluralize(template.schema.length, 'field')} defined
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 text-accent-green">
              <Save size={18} />
              <span className="text-sm font-medium">Saved</span>
            </div>
            <button
              onClick={() => void navigate(`/data/${templateId}`)}
              disabled={template.schema.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-primary text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              <Table size={18} />
              <span>Enter Data</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <div ref={mainContentRef} className="flex-1 overflow-y-auto p-8">
          <div
            ref={documentViewerRef}
            className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8"
            onClick={(e) => {
              if (e.target === e.currentTarget && activeFieldId) {
                setActiveFieldId(null);
              }
            }}
          >
            <DocumentViewer
              docxBlob={template.originalDocx}
              fields={template.schema}
              onTextSelected={handleTextSelected}
              onFieldClick={handleFieldClick}
              onPlainTextExtracted={handlePlainTextExtracted}
              activeFieldId={activeFieldId}
            />
          </div>
        </div>

        <FieldConnector
          fieldCardRect={connectorPoints.fieldCardRect}
          highlightRect={connectorPoints.highlightRect}
          activeFieldId={activeFieldId}
          fields={template.schema}
        />

        <FieldSidebar
          fields={template.schema}
          activeFieldId={activeFieldId}
          onFieldClick={handleFieldClick}
          onFieldEdit={handleFieldEdit}
          onFieldDelete={handleFieldDelete}
        />
      </div>

      <FieldDefinitionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedText(null);
          setEditingField(null);
        }}
        onSave={handleFieldSave}
        initialData={
          editingField
            ? {
                placeholder: editingField.placeholder,
                startPosition: editingField.startPosition,
                endPosition: editingField.endPosition,
                name: editingField.name,
                type: editingField.type,
              }
            : selectedText
            ? {
                placeholder: selectedText.placeholder,
                startPosition: selectedText.startPosition,
                endPosition: selectedText.endPosition,
              }
            : undefined
        }
        isEditMode={!!editingField}
      />
    </div>
  );
};
