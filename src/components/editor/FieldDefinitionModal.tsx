import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Field } from '../../types';

interface FieldDefinitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: Omit<Field, 'id'>) => void;
  initialData?: {
    placeholder: string;
    startPosition: number;
    endPosition: number;
    name?: string;
    type?: 'text' | 'number' | 'date';
  };
  isEditMode?: boolean;
}

export const FieldDefinitionModal: React.FC<FieldDefinitionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditMode = false,
}) => {
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<'text' | 'number' | 'date'>('text');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (isOpen && initialData) {
      setFieldName(initialData.name || '');
      setFieldType(initialData.type || 'text');
      setValidationError('');
    }
  }, [isOpen, initialData]);

  const handleSave = () => {
    const trimmedName = fieldName.trim();

    if (!trimmedName) {
      setValidationError('Field name is required');
      return;
    }

    if (trimmedName.length > 100) {
      setValidationError('Field name is too long (max 100 characters)');
      return;
    }

    if (!initialData) {
      return;
    }

    onSave({
      name: trimmedName,
      type: fieldType,
      placeholder: initialData.placeholder,
      startPosition: initialData.startPosition,
      endPosition: initialData.endPosition,
    });

    setFieldName('');
    setFieldType('text');
    setValidationError('');
  };

  const handleClose = () => {
    setFieldName('');
    setFieldType('text');
    setValidationError('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-neutral-gray/20">
          <h2 className="text-xl font-bold text-neutral-dark">
            {isEditMode ? 'Edit Field' : 'Define Field'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-neutral-light rounded-lg transition-colors"
          >
            <X size={20} className="text-neutral-gray" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-dark mb-2">
              Field Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fieldName}
              onChange={(e) => {
                setFieldName(e.target.value);
                setValidationError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Customer Name, Invoice Date"
              className="w-full px-4 py-2 border border-neutral-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              autoFocus
            />
            {validationError && (
              <p className="mt-1 text-sm text-red-600">{validationError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-dark mb-2">
              Field Type
            </label>
            <select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value as 'text' | 'number' | 'date')}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-2 border border-neutral-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
            </select>
          </div>

          {initialData && (
            <div>
              <label className="block text-sm font-semibold text-neutral-dark mb-2">
                Selected Text
              </label>
              <div className="px-4 py-3 bg-neutral-light rounded-lg text-neutral-dark text-sm font-mono">
                {initialData.placeholder.length > 100
                  ? `${initialData.placeholder.substring(0, 100)}...`
                  : initialData.placeholder}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-neutral-gray/20">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border-2 border-neutral-gray/30 text-neutral-dark rounded-lg font-semibold hover:bg-neutral-light transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-gradient-primary text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            {isEditMode ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
