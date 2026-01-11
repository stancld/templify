import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useTemplateEditor } from '../../hooks/useTemplateEditor';
import { TextSelection } from '../../hooks/useDocumentSelection';
import { DocumentViewer } from './DocumentViewer';
import { FieldSidebar } from './FieldSidebar';
import { FieldDefinitionModal } from './FieldDefinitionModal';
import { Field } from '../../types';

export const TemplateEditor: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();

  const {
    template,
    plainText,
    loading,
    error,
    addField,
    updateField,
    deleteField,
  } = useTemplateEditor(templateId || '');

  const [selectedText, setSelectedText] = useState<TextSelection | null>(null);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);

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
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 flex flex-col">
      <header className="bg-white border-b border-neutral-gray/20 px-6 py-4">
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
                {template.schema.length} field{template.schema.length !== 1 ? 's' : ''} defined
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              onClick={() => {}}
            >
              <Save size={18} />
              <span>Saved</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <DocumentViewer
              htmlContent={template.htmlContent}
              fields={template.schema}
              plainText={plainText}
              onTextSelected={handleTextSelected}
              onFieldClick={handleFieldClick}
              activeFieldId={activeFieldId}
            />
          </div>
        </div>

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
